import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Charge from "../../models/Charge";

interface PaymentRecord {
  amount: number;
  date: Date;
  method: string;
  reference?: string;
}

interface Request {
  chargeId: string | number;
  tenantId: number;
  amount: number;
  method: string;
  reference?: string;
}

interface Response extends Charge {}

const PayChargeService = async ({
  chargeId,
  tenantId,
  amount,
  method,
  reference
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive"),
    method: Yup.string()
      .required("Payment method is required")
      .oneOf(
        ["cash", "credit_card", "debit_card", "bank_transfer", "other"],
        "Invalid payment method"
      ),
    reference: Yup.string()
  });

  try {
    await schema.validate({ amount, method, reference });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const charge = await Charge.findOne({
    where: { id: chargeId, tenantId }
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  if (charge.status === "paid") {
    throw new AppError("Charge is already paid", 400);
  }

  if (charge.status === "canceled") {
    throw new AppError("Cannot pay a canceled charge", 400);
  }

  const paymentHistory =
    charge.paymentHistory && Array.isArray(charge.paymentHistory)
      ? charge.paymentHistory
      : [];

  const newPayment: PaymentRecord = {
    amount,
    date: new Date(),
    method,
    reference: reference || undefined
  };

  paymentHistory.push(newPayment);

  const totalPaid = paymentHistory.reduce(
    (sum: number, p: PaymentRecord) => sum + p.amount,
    0
  );

  const newStatus =
    totalPaid >= charge.amount
      ? "paid"
      : totalPaid > 0
        ? "pending"
        : "pending";

  await charge.update({
    paymentHistory,
    status: newStatus
  });

  await charge.reload();

  return charge;
};

export default PayChargeService;
