/*elslint-disable*/
const stripe = Stripe(
  'pk_test_51J7xAVSImjx41WueEAnS5miZsR24N9sxaayqfGhfKZVaomJGbIxdSwy0YQATUK018osf2Fb84sKkqDrv2YKZK3rs00u68VJ75i'
);

export const bookTour = async (tourid) => {
  try {
    // 1. Get the checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourid}`);

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {}
};
