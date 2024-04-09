"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/formatPrice"
import CartItem from "./cart-item"
import { loadStripe } from "@stripe/stripe-js"
import { makePaymentRequest } from "@/api/payments"

export default function Page() {
  const {items, removeAll} = useCart()
  const Prices = items.map((product => product.attributes.price))
  const totalPrice = Prices.reduce((total, price) => total + price, 0)
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

  const buyStripe = async() => {
    try {
      const stripe = await stripePromise
      const res = await makePaymentRequest.post("/api/orders", {
        products: items
      })
      await stripe?.redirectToCheckout({
        sessionId: res.data.stripeSession.id
      })
      removeAll()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-5 text-3xl font-bold">Carro de compras</h1>
      <div className="grid sm:grid-cols-2 sm:gap-5">
        <div>
          {items.length === 0 && (
            <p className="text-md">No hay productos en tu carrito.</p>
          )}
          <ul>
            {items.map((item) => (
              <CartItem key={item.id} product={item}/>
            ))}
          </ul>
        </div>
        <div className="max-w-xl">
            <div className="p-6 rounded-lg bg-slate-100">
              <p className="mb-3 text-lg font-semibold">Resumen del pedido</p>
              <Separator />
              <div className="flex justify-between gap-5 my-4">
                <p>Total del pedido</p>
                <p>{formatPrice(totalPrice)}</p>
              </div>
              <div className="flex items-center justify-center w-full mt-3">
                <Button className="w-full" onClick={buyStripe}>Comprar</Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
