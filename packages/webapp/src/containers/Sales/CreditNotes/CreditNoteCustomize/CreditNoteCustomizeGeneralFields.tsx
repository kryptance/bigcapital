// @ts-nocheck
import { Classes } from '@blueprintjs/core';
import { FFormGroup, FSwitch, Stack } from '@/components';
import { FColorInput } from '@/components/Forms/FColorInput';

export function CreditNoteCustomizeGeneralField() {
  return (
    <Stack style={{ padding: 20, flex: '1 1 auto' }}>
      <Stack spacing={0}>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>General Branding</h2>
        <p className={Classes.TEXT_MUTED}>
          Set your invoice details to be automatically applied every timeyou
          create a new invoice.
        </p>
      </Stack>

      <Stack spacing={0}>
        <FFormGroup
          name={'primaryColor'}
          label={'Primary Color'}
          // className={styles.fieldGroup}
          inline
          fastField
        >
          <FColorInput
            name={'primaryColor'}
            inputProps={{ style: { maxWidth: 120 } }}
            fastField
          />
        </FFormGroup>

        <FFormGroup
          name={'secondaryColor'}
          label={'Secondary Color'}
          // className={styles.fieldGroup}
          inline
          fastField
        >
          <FColorInput
            name={'secondaryColor'}
            inputProps={{ style: { maxWidth: 120 } }}
            fastField
          />
        </FFormGroup>

        <FFormGroup name={'showCompanyLogo'} label={'Logo'} fastField>
          <FSwitch
            name={'showCompanyLogo'}
            label={'Display company logo in the paper'}
            // className={styles.showCompanyLogoField}
            large
            fastField
          />
        </FFormGroup>
      </Stack>
    </Stack>
  );
}
