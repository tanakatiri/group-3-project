import express from 'express';
import Payment from '../models/Payment.js';
import RentalApplication from '../models/RentalApplication.js';
import House from '../models/House.js';
import { protect, authorize, protectAny } from '../middleware/auth.js';
import { upload } from '../config/upload.js';
import { logEvent } from '../utils/logger.js';

const router = express.Router();

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('❌ Multer error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum file size is 10MB.' 
      });
    }
    return res.status(400).json({ message: err.message });
  }
  next();
};

/**
 * POST /api/payments
 * Create a payment record (tenant makes payment)
 */
router.post('/', protect, authorize('tenant'), (req, res, next) => {
  upload.single('paymentProof')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    const { applicationId, amount, paymentType, paymentMethod, paymentReference, tenantNotes } = req.body;
    
    // Get application details
    const application = await RentalApplication.findById(applicationId)
      .populate('property')
      .populate('landlord');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Verify tenant owns this application
    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Verify application is approved
    if (application.status !== 'approved') {
      return res.status(400).json({ message: 'Can only make payment for approved applications' });
    }
    
    // Validate payment proof for non-cash payments
    if (paymentMethod !== 'cash' && !req.file) {
      return res.status(400).json({ 
        message: 'Payment proof (receipt or screenshot) is required for non-cash payments. Please upload proof of payment.' 
      });
    }
    
    // Prepare payment data
    const paymentData = {
      tenant: req.user._id,
      landlord: application.landlord._id,
      property: application.property._id,
      application: applicationId,
      amount: parseFloat(amount),
      paymentType: paymentType || 'deposit',
      paymentMethod: paymentMethod || 'bank_transfer',
      paymentReference: paymentReference || '',
      tenantNotes: tenantNotes || '',
      status: 'pending' // Starts as pending, admin will verify and mark as "held"
    };
    
    // Handle payment proof upload
    if (req.file) {
      paymentData.paymentProof = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename
      };
    }
    
    // Create payment
    const payment = await Payment.create(paymentData);
    
    // Populate for response
    await payment.populate('tenant', 'name email');
    await payment.populate('landlord', 'name email');
    await payment.populate('property', 'title location price');
    
    // Log event
    await logEvent({
      eventType: 'system_error', // We'll use this as generic event
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      description: `Payment submitted: $${amount} for ${application.property.title}`,
      metadata: { paymentId: payment._id, amount, paymentType },
      status: 'success'
    });
    
    res.status(201).json({
      message: 'Payment submitted successfully. Awaiting admin verification.',
      payment
    });
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Failed to submit payment', error: error.message });
  }
});

/**
 * GET /api/payments/my-payments
 * Get tenant's payments
 */
router.get('/my-payments', protect, authorize('tenant'), async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id })
      .populate('landlord', 'name email phone')
      .populate('property', 'title location price image')
      .populate('application')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/landlord-payments
 * Get landlord's payments
 */
router.get('/landlord-payments', protect, authorize('landlord'), async (req, res) => {
  try {
    const payments = await Payment.find({ landlord: req.user._id })
      .populate('tenant', 'name email phone')
      .populate('property', 'title location price image')
      .populate('application')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/all
 * Get all payments (admin only)
 */
router.get('/all', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const payments = await Payment.find()
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone')
      .populate('property', 'title location price image')
      .populate('application')
      .populate('verifiedBy', 'name email')
      .populate('releasedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

/**
 * PUT /api/payments/:id/verify
 * Verify payment and mark as "held" (admin only)
 */
router.put('/:id/verify', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { adminNotes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Can only verify pending payments' });
    }
    
    payment.status = 'held';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user._id;
    if (adminNotes) payment.adminNotes = adminNotes;
    
    await payment.save();
    
    await payment.populate('tenant', 'name email');
    await payment.populate('landlord', 'name email');
    await payment.populate('property', 'title');
    
    // Log event
    await logEvent({
      eventType: 'admin_action',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      description: `Payment verified and held: $${payment.amount}`,
      metadata: { paymentId: payment._id, amount: payment.amount },
      status: 'success'
    });
    
    res.json({
      message: 'Payment verified and held in escrow',
      payment
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

/**
 * PUT /api/payments/:id/release
 * Release payment to landlord (admin only)
 */
router.put('/:id/release', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { adminNotes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'held') {
      return res.status(400).json({ message: 'Can only release held payments' });
    }
    
    payment.status = 'released';
    payment.releasedAt = new Date();
    payment.releasedBy = req.user._id;
    if (adminNotes) payment.adminNotes = adminNotes;
    
    await payment.save();
    
    // Mark property as unavailable since it's now rented
    await House.findByIdAndUpdate(payment.property, { available: false });
    
    await payment.populate('tenant', 'name email');
    await payment.populate('landlord', 'name email');
    await payment.populate('property', 'title');
    
    // Log event
    await logEvent({
      eventType: 'admin_action',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      description: `Payment released to landlord: $${payment.amount}`,
      metadata: { paymentId: payment._id, amount: payment.amount, landlordId: payment.landlord._id },
      status: 'success'
    });
    
    res.json({
      message: 'Payment released to landlord',
      payment
    });
    
  } catch (error) {
    console.error('Error releasing payment:', error);
    res.status(500).json({ message: 'Failed to release payment' });
  }
});

/**
 * PUT /api/payments/:id/reject
 * Reject payment (admin only)
 */
router.put('/:id/reject', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { adminNotes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending payments' });
    }
    
    payment.status = 'rejected';
    if (adminNotes) payment.adminNotes = adminNotes;
    
    await payment.save();
    
    await payment.populate('tenant', 'name email');
    
    // Log event
    await logEvent({
      eventType: 'admin_action',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      description: `Payment rejected: $${payment.amount}`,
      metadata: { paymentId: payment._id, reason: adminNotes },
      status: 'warning'
    });
    
    res.json({
      message: 'Payment rejected',
      payment
    });
    
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ message: 'Failed to reject payment' });
  }
});

/**
 * PUT /api/payments/:id/refund
 * Refund payment to tenant (admin only)
 */
router.put('/:id/refund', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { refundReason } = req.body;
    
    if (!refundReason || refundReason.trim() === '') {
      return res.status(400).json({ message: 'Refund reason is required' });
    }
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Can only refund payments that are pending or held (not yet released)
    if (!['pending', 'held'].includes(payment.status)) {
      return res.status(400).json({ 
        message: `Cannot refund ${payment.status} payments. Only pending or held payments can be refunded.` 
      });
    }
    
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundedBy = req.user._id;
    payment.refundReason = refundReason;
    if (req.body.adminNotes) {
      payment.adminNotes = req.body.adminNotes;
    }
    
    await payment.save();
    
    await payment.populate('tenant', 'name email');
    await payment.populate('landlord', 'name email');
    await payment.populate('property', 'title');
    
    // Log event
    await logEvent({
      eventType: 'admin_action',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      description: `Payment refunded to tenant: $${payment.amount}`,
      metadata: { 
        paymentId: payment._id, 
        amount: payment.amount, 
        tenantId: payment.tenant._id,
        reason: refundReason 
      },
      status: 'success'
    });
    
    res.json({
      message: 'Payment refunded to tenant successfully',
      payment
    });
    
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ message: 'Failed to refund payment' });
  }
});

/**
 * GET /api/payments/stats
 * Get payment statistics (admin only)
 */
router.get('/stats', protectAny, async (req, res) => {
  // Check if user is admin or superadmin
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const stats = {
      total: await Payment.countDocuments(),
      pending: await Payment.countDocuments({ status: 'pending' }),
      held: await Payment.countDocuments({ status: 'held' }),
      released: await Payment.countDocuments({ status: 'released' }),
      rejected: await Payment.countDocuments({ status: 'rejected' }),
      refunded: await Payment.countDocuments({ status: 'refunded' }),
      totalAmount: 0,
      heldAmount: 0,
      releasedAmount: 0,
      refundedAmount: 0
    };
    
    // Calculate amounts
    const allPayments = await Payment.find();
    stats.totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    stats.heldAmount = allPayments.filter(p => p.status === 'held').reduce((sum, p) => sum + p.amount, 0);
    stats.releasedAmount = allPayments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.amount, 0);
    stats.refundedAmount = allPayments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

export default router;
