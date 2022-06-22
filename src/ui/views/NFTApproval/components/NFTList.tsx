import { NFTApproval } from '@/background/service/openapi';
import { Empty, Loading } from '@/ui/component';
import { connectStore, useRabbySelector } from '@/ui/store';
import { getKRCategoryByBrandname } from '@/utils/transaction';
import React from 'react';
import ReactGA from 'react-ga';
import { useTranslation } from 'react-i18next';
import IconSearch from 'ui/assets/search.svg';
import NFTListItem from './NFTListItem';

interface ApprovalCardProps {
  data?: NFTApproval[];
  loading?: boolean;
  onSearch(): void;
  onDecline(item: NFTApproval): void;
}

const NFTList = ({ data, loading, onSearch, onDecline }: ApprovalCardProps) => {
  const { t } = useTranslation();
  const currentAccount = useRabbySelector((s) => s.account.currentAccount);

  return (
    <div className="list">
      <div className="search" onClick={onSearch}>
        <img src={IconSearch} alt="" />
        <div className="placeholder">{t('Search Contracts  / NFTs')}</div>
      </div>
      <div className="list-header">
        <div className="column-title">{t('NFTs')}</div>
        <div className="column-title">{t('Approved to')}</div>
      </div>
      <div className="list-body">
        <Loading loading={loading} className="py-[120px]">
          {t('Loading')}
        </Loading>
        {!loading && (!data || data.length <= 0) && (
          <Empty className="pt-[80px]">{t('No Approvals')}</Empty>
        )}
        {!loading &&
          data?.map((item) => (
            <NFTListItem
              item={item}
              onDecline={(item) => {
                ReactGA.event({
                  category: 'Security',
                  action: 'startDeclineNFTApproval',
                  label: [
                    item.chain,
                    getKRCategoryByBrandname(currentAccount?.brandName),
                    currentAccount?.brandName,
                  ].join('|'),
                });
                onDecline(item);
              }}
              key={item.id}
            ></NFTListItem>
          ))}
      </div>
    </div>
  );
};

export default connectStore()(NFTList);
