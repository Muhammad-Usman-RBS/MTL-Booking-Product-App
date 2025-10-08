
export function formatPhoneNumber(phone) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (!cleaned || cleaned.length < 4) {
    return phone;
  }
  let countryCode = cleaned.slice(0, 4);
  if (!isNaN(parseInt(countryCode[0]))) {
    countryCode = cleaned.slice(0, 2); 
  }
  const localNumber = cleaned.slice(countryCode.length);
  const formattedPhone = `+${countryCode} ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
  return formattedPhone;
}
