export const FORM_RELATIONSHIP_OPTIONS = [
  'Existing Customer',
  'Potential Customer',
  'Architect / Interior Designer',
  'PMC Consultant',
  'Builder / Developer',
  'Business Partner',
  'Vendor / Supplier',
  'Friend / Family',
  'Other'
];

export const GUEST_DETAIL_RELATIONSHIP_OPTIONS = [
  'Architect',
  'Interior Designer',
  'Architect / Interior Designer',
  'PMC Consultant',
  'Builder / Developer',
  'Electrical Consultant / Contractor',
  'System Integrator',
  'Existing Customer',
  'Potential Customer',
  'Business Partner / Vendor',
  'Friend & Family',
  'Other'
];

export const toSelectOptions = (options = []) =>
  options.map((item) => ({ value: item, label: item }));
