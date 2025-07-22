function getDefaultAvaluoFormData() {
  return {
    appraisal_date: "",
    // Default to empty, override in 'nuevo' if needed
    vehicle_description: "",
    brand: "",
    model_year: (/* @__PURE__ */ new Date()).getFullYear(),
    color: "",
    mileage: 0,
    fuel_type: "GAS",
    // Default fuel type
    engine_size: 0,
    plate_number: "",
    applicant: "",
    owner: "",
    appraisal_value_usd: 0,
    appraisal_value_trochez: 0,
    apprasail_value_bank: 0,
    apprasail_value_lower_cost: 0,
    apprasail_value_lower_bank: 0,
    vin: "",
    vin_card: "",
    engine_number: "",
    engine_number_card: "",
    notes: "",
    extras: "",
    validity_days: 30,
    validity_kms: 1e3,
    modified_km: 0,
    extra_value: 0,
    discounts: 0,
    bank_value_in_dollars: 0,
    referencia_original: "",
    cert: "",
    vehicle_appraisal_id: null,
    deductions: []
  };
}
export {
  getDefaultAvaluoFormData as g
};
