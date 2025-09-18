const DEFAULT_META = {
    color: '#495057',
    background: '#E9ECEF'
};

const STATUS_META_MAP = {
    pending_shopper: { label: 'Pending Shopper', color: '#B58105', background: '#FFF3CD' },
    accepted_by_shopper: { label: 'Shopper Accepted', color: '#0F6674', background: '#D1ECF1' },
    shopper_at_shop: { label: 'Shopper at Shop', color: '#AA5B0E', background: '#FDEBD0' },
    shopping_in_progress: { label: 'Shopping in Progress', color: '#563D7C', background: '#EDE7F6' },
    shopper_revised_order: { label: 'Revised by Shopper', color: '#8A1644', background: '#FAD7E0' },
    customer_reviewing_revision: { label: 'Customer Reviewing', color: '#0F5132', background: '#D1E7DD' },
    customer_approved_revision: { label: 'Revision Approved', color: '#0F5132', background: '#D1E7DD' },
    revision_rejected: { label: 'Revision Rejected', color: '#842029', background: '#F8D7DA' },
    final_shopping: { label: 'Final Shopping', color: '#4C1D95', background: '#EDE9FE' },
    bill_uploaded: { label: 'Bill Uploaded', color: '#B58105', background: '#FFF3CD' },
    bill_approved: { label: 'Bill Approved', color: '#0F5132', background: '#D1E7DD' },
    bill_rejected: { label: 'Bill Rejected', color: '#842029', background: '#F8D7DA' },
    out_for_delivery: { label: 'Out for Delivery', color: '#0B5ED7', background: '#CFE2FF' },
    delivered: { label: 'Delivered', color: '#0F5132', background: '#D1E7DD' },
    cancelled: { label: 'Cancelled', color: '#495057', background: '#E9ECEF' },
    refunded: { label: 'Refunded', color: '#842029', background: '#F8D7DA' }
};

const ORDER_STATUS_SEQUENCE = [
    'pending_shopper',
    'accepted_by_shopper',
    'shopper_at_shop',
    'shopping_in_progress',
    'shopper_revised_order',
    'customer_reviewing_revision',
    'customer_approved_revision',
    'revision_rejected',
    'final_shopping',
    'bill_uploaded',
    'bill_approved',
    'bill_rejected',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded'
];

const formatStatusLabel = (status = '') =>
    status
        .split('_')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export const ORDER_STATUS_META = ORDER_STATUS_SEQUENCE.reduce((acc, status) => {
    acc[status] = {
        label: STATUS_META_MAP[status]?.label || formatStatusLabel(status),
        color: STATUS_META_MAP[status]?.color || DEFAULT_META.color,
        background: STATUS_META_MAP[status]?.background || DEFAULT_META.background
    };
    return acc;
}, {});

export const ORDER_STATUS_OPTIONS = ORDER_STATUS_SEQUENCE.map(status => ({
    value: status,
    label: ORDER_STATUS_META[status].label
}));

export const getStatusLabel = (status) => {
    if (!status) {
        return 'Unknown Status';
    }
    return ORDER_STATUS_META[status]?.label || formatStatusLabel(status);
};

export const getStatusMeta = (status) => {
    if (!status) {
        return { label: 'Unknown Status', ...DEFAULT_META };
    }
    return ORDER_STATUS_META[status] || { label: formatStatusLabel(status), ...DEFAULT_META };
};
