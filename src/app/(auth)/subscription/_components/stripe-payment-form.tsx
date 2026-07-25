"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { LoaderCircle, LockKeyhole, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type StripePaymentFormProps = {
  planName: string;
  amount: number;
  clientSecret: string;
  customerName?: string | null;
  customerEmail?: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

const elementOptions = {
  style: {
    base: {
      color: "#b8bac4",
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      lineHeight: "48px",
      "::placeholder": { color: "#8f9199" },
      iconColor: "#aaa8a2",
    },
    invalid: {
      color: "#f87171",
      iconColor: "#f87171",
    },
  },
};

const StripePaymentForm = ({
  planName,
  amount,
  clientSecret,
  customerName,
  customerEmail,
  onClose,
  onSuccess,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const card = elements?.getElement(CardNumberElement);

    if (!stripe || !elements || !card) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card,
          billing_details: {
            name: customerName || undefined,
            email: customerEmail || undefined,
          },
        },
      },
    );

    setIsSubmitting(false);

    if (error) {
      const message = error.message || "Payment could not be completed";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      sessionStorage.removeItem("beloosePaymentIntent");
      toast.success("Payment completed successfully");
      onSuccess();
      return;
    }

    if (paymentIntent?.status === "canceled") {
      onClose();
      return;
    }

    setErrorMessage("Payment is still processing. Please check again shortly.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div className="relative w-full max-w-[480px] rounded-[14px] border border-[#CBA24A] bg-[rgba(19,15,9,0.96)] px-6 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.65)] sm:px-10">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close payment form"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#B7A887] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="payment-title"
          className="text-center font-playfair text-[30px] font-semibold text-[#D5AB48]"
        >
          Secure Checkout
        </h2>
        <p className="mt-1 text-center text-sm text-[#9c9894]">
          <span className="font-semibold text-[#F5E7C2]">{planName}</span>
        </p>
        <p className="mt-1 text-center text-xs text-[#77736f]">
          Total due today: <span className="font-semibold text-white">${amount.toFixed(2)}</span>
        </p>

        <form className="mt-7" onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9c9894]">
            Card number
          </label>
          <div className="h-[52px] rounded-[7px] border border-[#6f5528] bg-[#3B2D16]/55 px-4 focus-within:border-[#CBA24A]">
            <CardNumberElement options={elementOptions} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9c9894]">
                Expiry date
              </label>
              <div className="h-[52px] rounded-[7px] border border-[#6f5528] bg-[#3B2D16]/55 px-4 focus-within:border-[#CBA24A]">
                <CardExpiryElement options={elementOptions} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9c9894]">
                Security code
              </label>
              <div className="h-[52px] rounded-[7px] border border-[#6f5528] bg-[#3B2D16]/55 px-4 focus-within:border-[#CBA24A]">
                <CardCvcElement options={elementOptions} />
              </div>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!stripe || isSubmitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[7px] bg-[#D5AB48] text-sm font-semibold text-[#241A0C] transition hover:bg-[#E2BA5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5E7C2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="mt-3 h-9 w-full text-xs text-[#B7A887] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBA24A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to plans
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#77736f]">
            <LockKeyhole className="h-3 w-3" />
            Secure payment powered by Stripe
          </p>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentForm;
