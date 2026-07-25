import type { Metadata } from "next";
import AuthLayoutDesign from "../_components/authLayout";
import PaymentSuccessContainer from "./_components/payment-success-container";

export const metadata: Metadata = {
  title: "Payment Successful | Humidor411",
};

const PaymentSuccessPage = () => (
  <AuthLayoutDesign>
    <PaymentSuccessContainer />
  </AuthLayoutDesign>
);

export default PaymentSuccessPage;
