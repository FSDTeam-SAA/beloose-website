import type { Metadata } from "next";
import AuthLayoutDesign from "../_components/authLayout";
import PaymentCancelContainer from "./_components/payment-cancel-container";

export const metadata: Metadata = {
  title: "Payment Cancelled | Humidor411",
};

const PaymentCancelPage = () => (
  <AuthLayoutDesign>
    <PaymentCancelContainer />
  </AuthLayoutDesign>
);

export default PaymentCancelPage;
