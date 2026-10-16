import { env } from "@/config/env";

// SSLCommerz's raw REST endpoints (v4 API). These are the same for every
// integration regardless of language/framework — see developer.sslcommerz.com.
const BASE_URL = env.sslcommerz.isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const SESSION_API = `${BASE_URL}/gwprocess/v4/api.php`;
const VALIDATION_API = `${BASE_URL}/validator/api/validationserverAPI.php`;

export interface InitiatePaymentInput {
  tranId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
}

interface SSLCommerzSessionResponse {
  status: string; // "SUCCESS" | "FAILED"
  failedreason?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
}

// Starts a payment session and returns the hosted checkout URL SSLCommerz
// wants the donor redirected to. That hosted page is what shows the donor
// bKash / Nagad / Rocket / cards / internet banking as selectable tabs —
// we don't need to build those buttons ourselves.
export const initiateSSLCommerzPayment = async (input: InitiatePaymentInput): Promise<string> => {
  if (!env.sslcommerz.storeId || !env.sslcommerz.storePassword) {
    throw new Error(
      "SSLCommerz is not configured yet. Set SSLCZ_STORE_ID and SSLCZ_STORE_PASSWORD in your backend .env " +
        "(sign up for a free sandbox store at https://developer.sslcommerz.com/registration/).",
    );
  }

  const body = new URLSearchParams({
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: String(input.amount),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${env.frontendUrl.replace(/\/$/, "")}/donate/result?status=success&tran_id=${input.tranId}`,
    fail_url: `${env.frontendUrl.replace(/\/$/, "")}/donate/result?status=fail&tran_id=${input.tranId}`,
    cancel_url: `${env.frontendUrl.replace(/\/$/, "")}/donate/result?status=cancel&tran_id=${input.tranId}`,
    ipn_url: `${process.env.BACKEND_PUBLIC_URL ?? ""}/api/donations/ipn`,
    shipping_method: "NO",
    product_name: "Donation",
    product_category: "Donation",
    product_profile: "general",
    num_of_item: "1",
    cus_name: input.donorName,
    cus_email: input.donorEmail,
    cus_phone: input.donorPhone,
    cus_add1: "Kanchana, Satkania, Chattogram",
    cus_city: "Chattogram",
    cus_country: "Bangladesh",
  });

  const response = await fetch(SESSION_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await response.json()) as SSLCommerzSessionResponse;

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(data.failedreason || "SSLCommerz session could not be created.");
  }

  return data.GatewayPageURL;
};

// Server-to-server verification of a completed transaction. Never trust the
// browser redirect alone (success_url) to mark a donation as paid — always
// confirm with this validation call, since a redirect can be spoofed but a
// server-side check against SSLCommerz's own API cannot.
export const validateSSLCommerzTransaction = async (valId: string) => {
  const params = new URLSearchParams({
    val_id: valId,
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    format: "json",
  });

  const response = await fetch(`${VALIDATION_API}?${params.toString()}`);
  return response.json();
};
