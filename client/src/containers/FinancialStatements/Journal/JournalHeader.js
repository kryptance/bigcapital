import React from 'react';
import moment from 'moment';
import { Formik, Form } from 'formik';
import { Tab, Tabs, Button, Intent } from '@blueprintjs/core';
import * as Yup from 'yup';
import { FormattedMessage as T } from 'components';

import JournalSheetHeaderGeneral from './JournalSheetHeaderGeneral';
import FinancialStatementHeader from 'containers/FinancialStatements/FinancialStatementHeader';

import withJournal from './withJournal';
import withJournalActions from './withJournalActions';

import { compose } from 'utils';

/**
 * Journal sheet header.
 */
function JournalHeader({
  pageFilter,
  onSubmitFilter,

  // #withJournalActions
  toggleJournalSheetFilter,

  // #withJournal
  journalSheetDrawerFilter,
}) {
  const initialValues = {
    ...pageFilter,
    fromDate: moment(pageFilter.fromDate).toDate(),
    toDate: moment(pageFilter.toDate).toDate(),
  };

  // Validation schema.
  const validationSchema = Yup.object().shape({
    fromDate: Yup.date().required(),
    toDate: Yup.date().min(Yup.ref('fromDate')).required(),
  });

  // Handle form submit.
  const handleSubmit = (values, { setSubmitting }) => {
    onSubmitFilter(values);
    setSubmitting(false);
    toggleJournalSheetFilter();
  };

  // Handle cancel journal drawer header.
  const handleCancelClick = () => {
    toggleJournalSheetFilter();
  };

  const handleDrawerClose = () => {
    toggleJournalSheetFilter();
  };

  return (
    <FinancialStatementHeader
      isOpen={journalSheetDrawerFilter}
      drawerProps={{ onClose: handleDrawerClose }}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <Form>
          <Tabs animate={true} vertical={true} renderActiveTabPanelOnly={true}>
            <Tab
              id="general"
              title={'General'}
              panel={<JournalSheetHeaderGeneral />}
            />
          </Tabs>

          <div class="financial-header-drawer__footer">
            <Button className={'mr1'} intent={Intent.PRIMARY} type={'submit'}>
              <T id={'calculate_report'} />
            </Button>
            <Button onClick={handleCancelClick} minimal={true}>
              <T id={'cancel'} />
            </Button>
          </div>
        </Form>
      </Formik>
    </FinancialStatementHeader>
  );
}

export default compose(
  withJournal(({ journalSheetDrawerFilter }) => ({
    journalSheetDrawerFilter,
  })),
  withJournalActions,
)(JournalHeader);
