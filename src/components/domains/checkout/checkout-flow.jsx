import _ from "lodash"
import React, { useEffect, useState } from "react"
import { useCart } from "../../../hooks/use-cart"
import { useCheckout } from "../../../hooks/use-checkout"
import { useCheckoutFlow } from "../../../hooks/use-checkout-flow"
import { useContactForm } from "../../../hooks/use-contact-form"
import { useShippingAddressForm } from "../../../hooks/use-shipping-address-form"
import { useShippingOptionForm } from "../../../hooks/use-shipping-option-form"
import ChevronLeft from "../../../icons/chevron-left.svg"
import CheckoutStepContainer from "../../checkout-step-container"
import Payment from "../payment"
import CheckoutAddress from "./checkout-address"
import CheckoutContact from "./checkout-contact"
import CheckoutDelivery from "./checkout-delivery"
import CheckoutLayout from "./checkout-layout"
import CheckoutSummary from "./checkout-summary"

const CheckoutFlow = () => {
  const { cart } = useCart()
  const { state, setState } = useCheckoutFlow()
  const [shippingOptions, setShippingOptions] = useState([])
  const {
    shippingMethod: { getShippingOptions },
  } = useCheckout()

  useEffect(() => {
    if (!cart?.id) {
      return
    }

    getShippingOptions(cart.id).then(options => {
      if (_.isEmpty(options)) {
        return
      }

      setShippingOptions(options)
    })

    return () => {
      setShippingOptions([])
    }
  }, [cart?.id, getShippingOptions])

  const update = step => {
    setState(step)
  }
  const [hideSummary, setHideSummary] = useState(true)

  const contactForm = useContactForm(setState)
  const shippingAddressForm = useShippingAddressForm(setState)
  const shippingOptionController = useShippingOptionForm(setState)

  let steps = [
    {
      title: "Contact",
      key: 0,
      completed: cart?.email !== null,
      controller: contactForm,
      children: (
        <CheckoutContact controller={contactForm} setState={setState} />
      ),
      handleSubmit: contactForm.handleSubmit,
    },
    {
      title: "Address",
      key: 1,
      completed: cart?.shipping_address !== null,
      controller: shippingAddressForm,
      children: (
        <CheckoutAddress controller={shippingAddressForm} setState={setState} />
      ),
      handleSubmit: shippingAddressForm.handleSubmit,
    },
    {
      title: "Delivery Method",
      key: 2,
      completed: cart?.shipping_methods?.length > 0,
      controller: shippingOptionController,
      children: (
        <CheckoutDelivery
          controller={shippingOptionController}
          options={shippingOptions}
          setState={setState}
        />
      ),
      handleSubmit: shippingOptionController.handleSubmit,
    },
    {
      title: "Payment",
      key: 3,
      completed: false,
      children: <Payment />,
      handleSubmit: () => console.log("next"),
    },
  ]

  return (
    <CheckoutLayout>
      <div className="flex flex-col">
        {steps.map(step => {
          return (
            <CheckoutStepContainer
              key={step.key}
              step={step.key}
              setState={setState}
              title={step.title}
              isOpen={step.key === state}
              isCompleted={step.completed}
            >
              {step.children}
              <div className="flex items-center justify-between">
                {step.key !== 0 && (
                  <button
                    className="text-gray-700 flex items-center"
                    onClick={() => update(step.key - 1)}
                  >
                    <img
                      src={ChevronLeft}
                      alt=""
                      aria-hidden="true"
                      className="w-3 h-3 mr-2"
                    />
                    <span>Go back</span>
                  </button>
                )}
                <div />
                {step.key !== steps.length - 1 && (
                  <button
                    type="submit"
                    className="btn-ui"
                    onClick={step.handleSubmit}
                    disabled={step.controller.isSubmitting}
                  >
                    Next
                  </button>
                )}
              </div>
            </CheckoutStepContainer>
          )
        })}
      </div>
      <CheckoutSummary
        hidden={hideSummary}
        cart={cart}
        shippingOption={shippingOptionController.selectedShippingMethod}
      />
    </CheckoutLayout>
  )
}

export default CheckoutFlow