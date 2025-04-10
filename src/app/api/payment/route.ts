import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { error400, error500, success200 } from "@/lib/utils"
import { createOrder, getCartItems, getProductWithImages } from "./helper"
import type { CheckoutItemProps } from "@/lib/types/types"
import Razorpay from "razorpay"
import { uid } from "uid"

// Initialize razorpay object
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
})

export async function POST(req: NextRequest) {
  let amount = 0
  const orderItems: any[] = []

  try {
    const { addressId } = await req.json()
    if (!addressId) return error400("Missing delivery address id", {})

    const checkoutCookie = req.cookies.get("checkout")?.value || ""
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return error400("Missing user ID in the session.", { user: null })
    }
    const userId = session.user.id

    if (checkoutCookie !== "") {
      const decodedItem: CheckoutItemProps = JSON.parse(atob(checkoutCookie))

      // Handle custom products (fasteners)
      if (decodedItem.isCustomProduct) {
        amount = (decodedItem.offerPrice || 0) * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1)

        const orderItem = {
          productId: null, // No product ID for custom products
          quantity: decodedItem.quantity,
          color: null,
          basePrice: (decodedItem.basePrice || 0) * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1),
          offerPrice: (decodedItem.offerPrice || 0) * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1),
          customProduct: decodedItem.customProductData || {
            title: decodedItem.title || "Custom Product",
            image: decodedItem.image || "/placeholder.svg",
            options: {},
          },
        }

        orderItems.push(orderItem)
      } else {
        // Handle regular products
        const dbProduct = await getProductWithImages(decodedItem.productId)

        if (!dbProduct) {
          return error400("The request is missing or contains an invalid product ID & Product Slug", { products: null })
        }

        amount = dbProduct.offerPrice * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1)

        const orderItem = {
          productId: dbProduct.id,
          quantity: decodedItem.quantity,
          color: decodedItem.color,
          basePrice: dbProduct.basePrice * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1),
          offerPrice: dbProduct.offerPrice * (decodedItem.quantity !== 0 ? decodedItem.quantity : 1),
        }

        orderItems.push(orderItem)
      }
    } else {
      const cartItems = await getCartItems(userId)

      if (!cartItems || cartItems.cartItems.length === 0) {
        return error400("User cart is empty!", { products: null })
      }

      // Calculate total amount and create order items
      for (const cartItem of cartItems.cartItems) {
        // Handle custom products (fasteners)
        if (cartItem.customProduct) {
          const itemPrice = cartItem.customProduct.offerPrice || 0
          const itemTotal = itemPrice * cartItem.quantity
          amount += itemTotal

          orderItems.push({
            productId: null, // No product ID for custom products
            quantity: cartItem.quantity,
            color: null,
            basePrice: cartItem.customProduct.basePrice * cartItem.quantity,
            offerPrice: itemPrice * cartItem.quantity,
            customProduct: cartItem.customProduct,
          })
        } else {
          // Handle regular products
          const itemPrice = cartItem.product.offerPrice
          const itemTotal = itemPrice * cartItem.quantity
          amount += itemTotal

          orderItems.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            color: cartItem.color,
            basePrice: cartItem.product.basePrice * cartItem.quantity,
            offerPrice: itemPrice * cartItem.quantity,
          })
        }
      }
    }

    const response = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: "INR",
      receipt: uid(),
      payment_capture: true,
    })

    const order_id = response.id.split("_")[1].toUpperCase()
    await createOrder(order_id, amount, userId, addressId, orderItems)

    if (checkoutCookie === "") {
      // Delete the cart after creating the order
      await db.cart.delete({
        where: {
          userId: userId,
        },
      })
    }

    return success200({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
      orderId: order_id,
    })
  } catch (error) {
    console.log(error)
    return error500({})
  }
}
