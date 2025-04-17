import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Sparkles, Shield, Check, Loader } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loadingState, setLoadingState] = useState(''); // Add this state

    const plans = [
        { 
            credits: 10, 
            amount: 99900,
            perCredit: '₹999/credit',
            description: 'Perfect for trying out the service',
            features: ['Basic access', '10 unique generations', 'Standard support']
        },
        { 
            credits: 25, 
            amount: 199900,
            perCredit: '₹799/credit',
            popular: true,
            description: 'Most popular choice for creators',
            features: ['Everything in Basic', '25 unique generations', 'Priority support']
        },
        { 
            credits: 50, 
            amount: 299900,
            perCredit: '₹599/credit',
            description: 'Best value for power users',
            features: ['Everything in Popular', '50 unique generations', 'Premium support']
        }
    ];

    const handlePayment = async (plan) => {
        if (loading) return;
        setLoading(true);
        setSelectedPlan(plan);
        setLoadingState('initiating'); // Set loading state
        
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/payment/create-order`, {
                amount: plan.amount,
                credits: plan.credits
            });

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'AstraPix',
                description: `${plan.credits} Credits Purchase`,
                order_id: data.orderId,
                handler: async (response) => {
                    try {
                        setVerifying(true);
                        setLoadingState('verifying'); // Update loading state
                        const verifyData = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/payment/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setLoadingState('success');
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Show success briefly
                        onSuccess(verifyData.data.credits);
                        onClose();
                        toast.success('Payment successful! Credits added to your account.', {
                            position: window.innerWidth < 640 ? 'bottom-center' : 'top-right',
                            duration: 4000
                        });
                    } catch (error) {
                        setLoadingState('error');
                        toast.error('Payment verification failed', {
                            position: window.innerWidth < 640 ? 'bottom-center' : 'top-right'
                        });
                    } finally {
                        setVerifying(false);
                        setLoadingState('');
                    }
                },
                theme: { color: '#7C3AED' },
                prefill: {
                    name: 'AstraPix User',
                    contact: '',
                    email: ''
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        setSelectedPlan(null);
                        setLoadingState('');
                    },
                    animation: true,
                    backdropclose: false
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            setLoadingState('error');
            toast.error('Failed to initiate payment', {
                position: window.innerWidth < 640 ? 'bottom-center' : 'top-right'
            });
        } finally {
            setLoading(false);
            setSelectedPlan(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overscroll-contain touch-none"
            >
                {/* Loading/Verification Overlay */}
                {(loadingState || verifying) && (
                    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-6">
                        <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 animate-spin mb-2 sm:mb-4" />
                        <p className="text-white/80 text-base sm:text-lg font-medium text-center">
                            {loadingState === 'initiating' && 'Initiating payment...'}
                            {loadingState === 'verifying' && 'Verifying payment...'}
                            {loadingState === 'success' && 'Payment successful!'}
                            {loadingState === 'error' && 'Payment failed'}
                        </p>
                        {(loadingState === 'initiating' || loadingState === 'verifying') && (
                            <motion.div 
                                className="h-1 bg-purple-500/20 w-36 sm:w-48 mt-3 sm:mt-4 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-purple-500"
                                    animate={{
                                        x: [-144, 144],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear",
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>
                )}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border border-purple-500/20 rounded-xl p-4 sm:p-6 max-w-6xl w-full mx-2 sm:mx-4 shadow-xl max-h-[90vh] overflow-y-auto overscroll-contain"
                >
                    <div className="text-center mb-4 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Purchase Credits</h2>
                        </div>
                        <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto">
                            Power up your creativity with AstraPix credits. Choose a plan that suits your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
                        {plans.map((plan) => (
                            <motion.button
                                key={plan.credits}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePayment(plan)}
                                disabled={loading || verifying}
                                className={`w-full p-3 sm:p-6 rounded-lg border-2 relative text-left h-full flex flex-col touch-manipulation ${
                                    selectedPlan === plan
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 hover:border-purple-500/50'
                                } ${(loading || verifying) ? 'opacity-50 cursor-not-allowed' : ''} transition-all group`}
                                aria-label={`Purchase ${plan.credits} credits for ₹${(plan.amount / 100).toLocaleString()}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2 sm:-top-3 -right-1 sm:-right-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500 text-white text-xs rounded-full">
                                        Popular Choice
                                    </div>
                                )}

                                <div className="flex flex-col flex-grow">
                                    <div className="mb-2 sm:mb-4">
                                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                                            <div>
                                                <span className="text-xl sm:text-2xl font-bold text-white">
                                                    {plan.credits} Credits
                                                </span>
                                                <p className="text-purple-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{plan.perCredit}</p>
                                            </div>
                                            <span className="text-2xl sm:text-3xl font-bold text-white">
                                                ₹{(plan.amount / 100).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-white/60 text-xs sm:text-sm">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="space-y-2 sm:space-y-3 flex-grow">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80">
                                                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-white/10 pt-4 sm:pt-6">
                        <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-purple-500/10 rounded-lg w-full sm:w-auto">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                            <span className="text-xs sm:text-sm text-white/80">Secure payment powered by Razorpay</span>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <button
                                onClick={onClose}
                                className="px-3 sm:px-4 py-2 text-white/60 hover:text-white transition-colors touch-manipulation"
                                aria-label="Close modal"
                            >
                                Close
                            </button>
                            <a 
                                href="mailto:support@astrapix.com"
                                className="px-3 sm:px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors touch-manipulation"
                            >
                                Need Help?
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentModal;