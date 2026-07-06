/** Approximate lat/lng centroid for each Iranian province capital,
 * used to place markers on the landing-page health-assistant map. */
export const provinceCenters = {
  "آذربایجان شرقی": [38.0806, 46.2919],
  "آذربایجان غربی": [37.5527, 45.0761],
  "اردبیل": [38.2498, 48.2933],
  "اصفهان": [32.6546, 51.668],
  "البرز": [35.8355, 50.9915],
  "ایلام": [33.6374, 46.4227],
  "بوشهر": [28.9684, 50.8385],
  "تهران": [35.6892, 51.389],
  "چهارمحال و بختیاری": [32.3256, 50.8642],
  "خراسان جنوبی": [32.8649, 59.2262],
  "خراسان رضوی": [36.2605, 59.6168],
  "خراسان شمالی": [37.4747, 57.331],
  "خوزستان": [31.3183, 48.6706],
  "زنجان": [36.6736, 48.4787],
  "سمنان": [35.5729, 53.3971],
  "سیستان و بلوچستان": [29.4963, 60.8629],
  "فارس": [29.5918, 52.5837],
  "قزوین": [36.28, 50.0041],
  "قم": [34.6401, 50.8764],
  "کردستان": [35.3111, 46.9923],
  "کرمان": [30.2839, 57.0834],
  "کرمانشاه": [34.3277, 47.065],
  "کهگیلویه و بویراحمد": [30.6683, 51.5896],
  "گلستان": [36.8456, 54.4295],
  "گیلان": [37.2809, 49.5832],
  "لرستان": [33.4878, 48.3558],
  "مازندران": [36.5659, 53.0588],
  "مرکزی": [34.0917, 49.6892],
  "هرمزگان": [27.1865, 56.2808],
  "همدان": [34.7989, 48.5146],
  "یزد": [31.8974, 54.3569],
};

export function getProvinceCenter(province) {
  return provinceCenters[province] || null;
}

/** Spread multiple markers within the same province in a small circle
 * around its centroid so they don't fully overlap. */
export function jitterCoordinate([lat, lng], index, total) {
  if (total <= 1) return [lat, lng];
  const angle = (2 * Math.PI * index) / total;
  const radius = 0.15;
  return [lat + radius * Math.sin(angle), lng + radius * Math.cos(angle)];
}
