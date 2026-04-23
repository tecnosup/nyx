import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

const phoneSchema = z
  .string()
  .trim()
  .refine((v) => {
    const d = digits(v);
    return d.length === 10 || d.length === 11;
  }, "Telefone inválido (use DDD + número)");

const cepSchema = z
  .string()
  .trim()
  .refine((v) => digits(v).length === 8, "CEP inválido");

const ufSchema = z
  .string()
  .trim()
  .length(2, "UF deve ter 2 letras")
  .transform((v) => v.toUpperCase());

export const shippingSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto").max(120),
  phone: phoneSchema,
  cep: cepSchema,
  street: z.string().trim().min(2, "Rua obrigatória").max(200),
  number: z.string().trim().min(1, "Número obrigatório").max(10),
  complement: z.string().trim().max(100).optional().or(z.literal("")),
  neighborhood: z.string().trim().min(2, "Bairro obrigatório").max(120),
  city: z.string().trim().min(2, "Cidade obrigatória").max(120),
  state: ufSchema,
});

export const paymentMethodSchema = z.enum([
  "pix",
  "cartao",
  "transferencia",
  "combinar",
]);

export const checkoutSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  pricePix: z.number().nonnegative().max(100_000),
  priceCard: z.number().nonnegative().max(100_000),
  size: z.string().min(1),
  shipping: shippingSchema,
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type ShippingInput = z.infer<typeof shippingSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
