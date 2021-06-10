import React from 'react';
import classNames from 'classnames';
import { FormGroup, ControlGroup, Position, Classes } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { FastField, ErrorMessage } from 'formik';
import moment from 'moment';
import {
  MoneyInputGroup,
  InputPrependText,
  CurrencySelectList,
  Row,
  Col,
} from 'components';
import { FormattedMessage as T } from 'components';
import { momentFormatter, tansformDateValue, inputIntent } from 'utils';
import { useVendorFormContext } from './VendorFormProvider';

/**
 * Vendor Finaniceal Panel Tab.
 */
export default function VendorFinanicalPanelTab() {
  const { vendorId, currencies } = useVendorFormContext();

  return (
    <div className={'tab-panel--financial'}>
      <Row>
        <Col xs={6}>
          {/*------------ Opening balance at -----------*/}
          <FastField name={'opening_balance_at'}>
            {({ form, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'opening_balance_at'} />}
                className={classNames('form-group--select-list', Classes.FILL)}
                intent={inputIntent({ error, touched })}
                inline={true}
                helperText={<ErrorMessage name="opening_balance_at" />}
              >
                <DateInput
                  {...momentFormatter('YYYY/MM/DD')}
                  onChange={(date) => {
                    form.setFieldValue(
                      'opening_balance_at',
                      moment(date).format('YYYY-MM-DD'),
                    );
                  }}
                  value={tansformDateValue(value)}
                  popoverProps={{ position: Position.BOTTOM, minimal: true }}
                  disabled={vendorId}
                />
              </FormGroup>
            )}
          </FastField>
          {/*------------ Opening balance  -----------*/}
          <FastField name={'opening_balance'}>
            {({ form, field, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'opening_balance'} />}
                className={classNames(
                  'form-group--opening-balance',
                  Classes.FILL,
                )}
                intent={inputIntent({ error, touched })}
                inline={true}
              >
                <ControlGroup>
                  <InputPrependText text={form.values.currency_code} />
                  <MoneyInputGroup
                    value={value}
                    inputGroupProps={{
                      fill: true,
                      // ...field,
                    }}
                    onChange={(balance) => {
                      form.setFieldValue('opening_balance', balance);
                    }}
                    disabled={vendorId}
                  />
                </ControlGroup>
              </FormGroup>
            )}
          </FastField>

          {/*------------ Currency  -----------*/}
          <FastField name={'currency_code'}>
            {({ form, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'currency'} />}
                className={classNames(
                  'form-group--select-list',
                  'form-group--balance-currency',
                  Classes.FILL,
                )}
                inline={true}
              >
                <CurrencySelectList
                  currenciesList={currencies}
                  selectedCurrencyCode={value}
                  onCurrencySelected={(currency) => {
                    form.setFieldValue('currency_code', currency.currency_code);
                  }}
                  disabled={true}
                />
              </FormGroup>
            )}
          </FastField>
        </Col>
      </Row>
    </div>
  );
}
