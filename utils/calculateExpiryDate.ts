import moment from 'moment';

enum Interval {
  MONTHLY = 'monthly',
  ANNUALLY = 'annually',
}

const calculateExpiry = (interval: string) => {
  const now = moment().format('YYYY-MM-DD');
  const period = interval === Interval.MONTHLY ? 'months' : 'years';
  return moment(now).add(1, period).toDate();
};

export default calculateExpiry;
