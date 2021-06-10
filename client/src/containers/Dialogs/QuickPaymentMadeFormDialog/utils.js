import moment from 'moment';
import intl from 'react-intl-universal';

// Default initial values of payment made.
export const defaultPaymentMade = {
  vendor_id: '',
  payment_account_id: '',
  payment_date: moment(new Date()).format('YYYY-MM-DD'),
  reference: '',
  payment_number: '',
  // statement: '',
  entries: [{ bill_id: '', payment_amount: '' }],
};

export const transformErrors = (errors, { setFieldError }) => {
  const getError = (errorType) => errors.find((e) => e.type === errorType);

  if (getError('PAYMENT.NUMBER.NOT.UNIQUE')) {
    setFieldError(
      'payment_number',
      intl.get('payment_number_is_not_unique'),
    );
  }
  if (getError('INVALID_PAYMENT_AMOUNT')) {
    setFieldError(
      'payment_amount',
      intl.get('the_payment_amount_bigger_than_invoice_due_amount'),
    );
  }
};
