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

  // Validate numeric fields
  if (formData.apprasail_value_lower_cost && Number(formData.apprasail_value_lower_cost) < 0) {
    errors.apprasail_value_lower_cost = 'El valor de menor costo no puede ser negativo';
  }
  
  if (formData.apprasail_value_lower_bank && Number(formData.apprasail_value_lower_bank) < 0) {
    errors.apprasail_value_lower_bank = 'El valor de menor banco no puede ser negativo';
  }

  if (formData.extra_value && Number(formData.extra_value) < 0) {
    errors.extra_value = 'El valor extra no puede ser negativo';
  }

  if (formData.discounts && Number(formData.discounts) < 0) {
    errors.discounts = 'Los descuentos no pueden ser negativos';
  }

  if (formData.bank_value_in_dollars && Number(formData.bank_value_in_dollars) < 0) {
    errors.bank_value_in_dollars = 'El valor del banco en dólares no puede ser negativo';
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
  cleanedData.modified_km = Number(cleanedData.modified_km) || 0;
  cleanedData.vehicle_appraisal_id = Number(cleanedData.vehicle_appraisal_id) || null;
  
  // Convert string numeric fields
  cleanedData.extra_value = Number(cleanedData.extra_value) || 0;
  cleanedData.discounts = Number(cleanedData.discounts) || 0;
  cleanedData.bank_value_in_dollars = Number(cleanedData.bank_value_in_dollars) || 0;

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
 * Maps API response data to form data structure.
 * Handles both new and existing avalúos.
 * @param {object} apiData - The data from the API response.
 * @returns {object} The mapped form data object.
 */
export function mapApiDataToFormData(apiData) {
  return {
    id: apiData.id || null,
    vehicle_appraisal_id: apiData.vehicle_appraisal_id || apiData.id || null,
    appraisal_date: apiData.appraisal_date || '',
    vehicle_description: apiData.vehicle_description || '',
    brand: apiData.brand || '',
    model_year: apiData.model_year || new Date().getFullYear(),
    color: apiData.color || '',
    mileage: apiData.mileage || 0,
    fuel_type: apiData.fuel_type || 'GAS',
    engine_size: apiData.engine_size || 0,
    plate_number: apiData.plate_number || '',
    applicant: apiData.applicant || '',
    owner: apiData.owner || '',
    appraisal_value_usd: apiData.appraisal_value_usd || 0,
    appraisal_value_trochez: apiData.appraisal_value_trochez || 0,
    apprasail_value_bank: apiData.apprasail_value_bank || 0,
    apprasail_value_lower_cost: apiData.apprasail_value_lower_cost || 0,
    apprasail_value_lower_bank: apiData.apprasail_value_lower_bank || 0,
    vin: apiData.vin || '',
    vin_card: apiData.vin_card || '',
    engine_number: apiData.engine_number || '',
    engine_number_card: apiData.engine_number_card || '',
    notes: apiData.notes || '',
    extras: apiData.extras || '',
    validity_days: apiData.validity_days || 30,
    validity_kms: apiData.validity_kms || 1000,
    modified_km: apiData.modified_km || 0,
    extra_value: apiData.extra_value || 0,
    discounts: apiData.discounts || 0,
    bank_value_in_dollars: apiData.bank_value_in_dollars || 0,
    referencia_original: apiData.referencia_original || '',
    cert: apiData.cert || '',
    deductions: apiData.deductions || []
  };
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
    apprasail_value_lower_cost: 0,
    apprasail_value_lower_bank: 0,
    vin: '',
    vin_card: '', 
    engine_number: '',
    engine_number_card: '',
    notes: '',
    extras: '',
    validity_days: 30,
    validity_kms: 1000,
    modified_km: 0,
    extra_value: 0,
    discounts: 0,
    bank_value_in_dollars: 0,
    referencia_original: '',
    cert: '',
    vehicle_appraisal_id: null,
    deductions: []
  };
}