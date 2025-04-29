/**
 * Validates the core fields of the avaluo form data.
 * @param {object} formData - The form data object.
 * @returns {object} An object containing validation errors. Keys are field names, values are error messages.
 */
export function validateAvaluoFormData(formData) {
  const errors = {};

  // Required fields
  if (!formData.applicant) {
    errors.applicant = 'El solicitante es obligatorio.';
  }
  if (!formData.brand) {
    errors.brand = 'La marca es obligatoria.';
  }
  if (!formData.vehicle_description) {
    errors.vehicle_description = 'La descripción es obligatoria.';
  }
  if (!formData.appraisal_value_trochez) {
    errors.appraisal_value_trochez = 'El valor local es obligatorio.';
  } else if (Number(formData.appraisal_value_trochez) <= 0) {
    // Check > 0 only if the field has a value
    errors.appraisal_value_trochez = 'El valor local debe ser mayor que cero.';
  }

  // Length checks
  if (formData.vin && formData.vin.length > 17) {
    errors.vin = 'El VIN no debe exceder 17 caracteres';
  }
  if (formData.engine_number && formData.engine_number.length > 17) {
    errors.engine_number = 'El número de motor no debe exceder 17 caracteres';
  }
  
  if (formData.vin_card && formData.vin_card.length > 17) {
    errors.vin_card = 'El VIN (Tarjeta) no debe exceder 17 caracteres';
  }
  if (formData.engine_number_card && formData.engine_number_card.length > 17) {
    errors.engine_number_card = 'El número de motor (Tarjeta) no debe exceder 17 caracteres';
  }


  return errors;
}

/**
 * Cleans and prepares the avaluo form data for API submission.
 * Converts fields to appropriate types (Number) and cleans the deductions array.
 * @param {object} formData - The raw form data object.
 * @returns {object} The cleaned form data object ready for the API.
 */
export function cleanAvaluoFormData(formData) {
  const cleanedData = { ...formData };

  // Convert numeric fields
  cleanedData.model_year = Number(cleanedData.model_year) || null;
  cleanedData.mileage = Number(cleanedData.mileage) || 0;
  cleanedData.engine_size = Number(cleanedData.engine_size) || null;
  cleanedData.appraisal_value_usd = Number(cleanedData.appraisal_value_usd) || 0;
  cleanedData.appraisal_value_trochez = Number(cleanedData.appraisal_value_trochez) || 0;
  cleanedData.apprasail_value_bank = Number(cleanedData.apprasail_value_bank) || 0;
  cleanedData.apprasail_value_lower_cost = Number(cleanedData.apprasail_value_lower_cost) || 0;
  cleanedData.apprasail_value_lower_bank = Number(cleanedData.apprasail_value_lower_bank) || 0;
  cleanedData.validity_days = Number(cleanedData.validity_days) || 30;
  cleanedData.validity_kms = Number(cleanedData.validity_kms) || 1000;

  // Clean deductions array
  if (cleanedData.deductions && Array.isArray(cleanedData.deductions)) {
    cleanedData.deductions = cleanedData.deductions
      .map(d => ({
        description: d.description || '',
        amount: Number(d.amount) || 0
      }))
      .filter(d => d.description || d.amount > 0);
  } else {
    cleanedData.deductions = [];
  }

  // Remove fields potentially added by the form component but not needed directly by API
  // (Example: if the form added temporary calculation fields)
  // delete cleanedData.someTemporaryField; 

  return cleanedData;
}

/**
 * Returns the default structure for avaluo form data.
 * @returns {object} The default form data object.
 */
export function getDefaultAvaluoFormData() {
  return {
    appraisal_date: '', // Default to empty, override in 'nuevo' if needed
    vehicle_description: '',
    brand: '',
    model_year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    fuel_type: 'GAS', // Default fuel type
    engine_size: 0,
    plate_number: '',
    applicant: '',
    owner: '',
    appraisal_value_usd: 0,
    appraisal_value_trochez: 0,
    apprasail_value_bank: 0,
    vin: '',
    vin_card: '', 
    engine_number: '',
    engine_number_card: '',
    notes: '',
    extras: '',
    validity_days: 30,
    validity_kms: 1000,
    deductions: []
  };
}