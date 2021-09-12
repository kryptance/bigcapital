import React from 'react';
import intl from 'react-intl-universal';
import { DrawerHeaderContent, DrawerLoading } from 'components';
import { useTransactionsByReference, usePaymentReceive } from 'hooks/query';

const PaymentReceiveDetailContext = React.createContext();

/**
 * Payment receive detail provider.
 */
function PaymentReceiveDetailProvider({ paymentReceiveId, ...props }) {
  const {
    data: paymentReceive,
    isLoading: isPaymentLoading,
    isFetching: isPaymentFetching,
  } = usePaymentReceive(paymentReceiveId, {
    enabled: !!paymentReceiveId,
  });

  // Handle fetch transaction by reference.
  const {
    data: { transactions },
    isLoading: isTransactionLoading,
  } = useTransactionsByReference(
    {
      reference_id: paymentReceiveId,
      reference_type: 'paymentReceive',
    },
    { enabled: !!paymentReceiveId },
  );

  // Provider.
  const provider = {
    isPaymentFetching,
    transactions,
    paymentReceive,
    paymentReceiveId,
  };

  return (
    <DrawerLoading loading={isTransactionLoading || isPaymentLoading}>
      <DrawerHeaderContent
        name="payment-receive-detail-drawer"
        title={intl.get('payment_receive_details')}
      />
      <PaymentReceiveDetailContext.Provider value={provider} {...props} />
    </DrawerLoading>
  );
}

const usePaymentReceiveDetailContext = () =>
  React.useContext(PaymentReceiveDetailContext);

export { PaymentReceiveDetailProvider, usePaymentReceiveDetailContext };
