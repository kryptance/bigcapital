// @ts-nocheck
import {useEffect, useMemo, useState} from 'react';
import * as R from 'ramda';
import {useAppQueryString} from '@/hooks';
import {FInputGroup, Group,} from '@/components';
import {useAccountTransactionsContext} from './AccountTransactionsProvider';
import {TagsControl} from '@/components/TagsControl';
import {AccountUncategorizedDateFilter} from './UncategorizedTransactions/AccountUncategorizedDateFilter';
import {Divider} from '@blueprintjs/core';
import {Formik} from "formik";
import './AccountTransactionsUncategorizeFilter.scss';
import {withBankingActions} from "@/containers/CashFlow/withBankingActions";

const AccountUncategorizedMatchDescriptionFilter = R.compose(
    withBankingActions)(
    ({
         // #withBankingActions
         setUncategorizedTransactionsFilter,
     }) => {
    const [keyStroke, setKeyStroke] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [waiting, setWaiting] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState('');

    useEffect(() => {
        if ((inputValue || debouncedValue) && debouncedValue !== inputValue) {
            setDebouncedValue(inputValue);
            setWaiting(true);
            const timer = setTimeout(() => {
                setKeyStroke(0);
                setWaiting(false);
                setUncategorizedTransactionsFilter({matchDescription: inputValue});
            }, 1000);

            return () => {
                clearTimeout(timer)
            };
        }
    }, [inputValue]);

    return <Formik
        initialValues={{matchDescription: ''}}
        onSubmit={() => {}}>
        <div className="input-container">
            <FInputGroup value={inputValue} name="matchDescription" placeholder={'Match Description'}
                         onChange={(event) => {
                             setWaiting(false);
                             setKeyStroke(keyStroke + 1);
                             setInputValue(event.target.value);
                         }}/>
            <div className="countdown-circle" style={{visibility: waiting ? 'visible' : 'hidden'}}
                 key={keyStroke}></div>
        </div>
    </Formik>
})

export function AccountTransactionsUncategorizeFilter() {
    const {bankAccountMetaSummary} = useAccountTransactionsContext();
    const [locationQuery, setLocationQuery] = useAppQueryString();

    const totalUncategorized =
        bankAccountMetaSummary?.totalUncategorizedTransactions;
    const totalRecognized = bankAccountMetaSummary?.totalRecognizedTransactions;

    const totalPending = bankAccountMetaSummary?.totalPendingTransactions;

    const handleTabsChange = (value) => {
        setLocationQuery({uncategorizedFilter: value});
    };

    const options = useMemo(
        () =>
            R.when(
                () => totalPending > 0,
                R.append({
                    value: 'pending',
                    label: (
                        <>
                            Pending <strong>({totalPending})</strong>
                        </>
                    ),
                }),
            )([
                {
                    value: 'all',
                    label: (
                        <>
                            All <strong>({totalUncategorized})</strong>
                        </>
                    ),
                },
                {
                    value: 'recognized',
                    label: (
                        <>
                            Recognized <strong>({totalRecognized})</strong>
                        </>
                    ),
                },
            ]),
        [totalPending, totalRecognized, totalUncategorized],
    );

    return (
        <Group position={'apart'} style={{marginBottom: 14}}>
            <Group align={'stretch'} spacing={10}>
                <TagsControl
                    options={options}
                    value={locationQuery?.uncategorizedFilter || 'all'}
                    onValueChange={handleTabsChange}
                />
                <Divider/>
                <AccountUncategorizedMatchDescriptionFilter/>
                <Divider/>
                <AccountUncategorizedDateFilter/>
            </Group>

            <TagsControl
                options={[{value: 'excluded', label: 'Excluded'}]}
                value={locationQuery?.uncategorizedFilter || 'all'}
                onValueChange={handleTabsChange}
            />
        </Group>
    );
}
