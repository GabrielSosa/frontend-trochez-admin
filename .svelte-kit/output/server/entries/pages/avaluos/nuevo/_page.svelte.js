import { c as create_ssr_component, g as createEventDispatcher, e as escape, f as add_attribute, h as each, v as validate_component } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/state.svelte.js";
import { N as Navbar } from "../../../../chunks/Navbar.js";
import "toastify-js";
/* empty css                          */
import "sweetalert2";
const AvaluoForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalDeductions;
  let apprasail_value_lower_cost;
  let apprasail_value_lower_bank;
  let requiredVehicleDescription;
  let { formData } = $$props;
  let { validationErrors = {} } = $$props;
  let { isSubmitting = false } = $$props;
  let { isEdit = false } = $$props;
  createEventDispatcher();
  if (!formData.deductions) {
    formData.deductions = [];
  }
  if (formData.apprasail_value_bank === void 0) {
    formData.apprasail_value_bank = 0;
  }
  if (formData.extras === void 0) {
    formData.extras = "";
  }
  if (formData.cert === void 0) {
    formData.cert = "";
  }
  if (formData.bank_value_in_dollars === void 0) {
    formData.bank_value_in_dollars = 0;
  }
  if (formData.discounts === void 0) {
    formData.discounts = 0;
  }
  if ($$props.formData === void 0 && $$bindings.formData && formData !== void 0) $$bindings.formData(formData);
  if ($$props.validationErrors === void 0 && $$bindings.validationErrors && validationErrors !== void 0) $$bindings.validationErrors(validationErrors);
  if ($$props.isSubmitting === void 0 && $$bindings.isSubmitting && isSubmitting !== void 0) $$bindings.isSubmitting(isSubmitting);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0) $$bindings.isEdit(isEdit);
  totalDeductions = formData.deductions.reduce(
    (sum, deduction) => {
      const amount = Number(deduction.amount) || 0;
      return sum + amount;
    },
    0
  );
  apprasail_value_lower_cost = Math.max(0, (Number(formData.appraisal_value_trochez) || 0) * 0.92 - totalDeductions - (Number(formData.discounts) || 0));
  apprasail_value_lower_bank = Math.max(0, (Number(formData.apprasail_value_bank) || 0) - totalDeductions - (Number(formData.discounts) || 0));
  requiredVehicleDescription = !isEdit;
  return `<form class="bg-white rounded-lg shadow overflow-hidden"> <div class="p-6 border-b border-gray-200"><div class="flex justify-between items-start gap-6 mb-4"> <div class="w-1/4"><label for="appraisal_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1se3ncz">No. Avalúo</label> <p class="w-full p-1 border-b border-gray-400 text-sm font-semibold">${escape(formData.appraisal_number || "N/A")}</p></div>  <div class="w-1/3"><div class="border border-gray-300 rounded-md p-2 space-y-1 text-right"><div><input id="appraisal_date" type="date" required class="${[
    "focus:outline-none text-lg text-right",
    (validationErrors?.appraisal_date ? "border-red-500" : "") + " " + (!validationErrors?.appraisal_date ? "border-b" : "") + " " + (!validationErrors?.appraisal_date ? "border-gray-400" : "")
  ].join(" ").trim()}"${add_attribute("value", formData.appraisal_date, 0)}> ${validationErrors?.appraisal_date ? `<p class="text-red-500 text-xs mt-1 text-right">${escape(validationErrors.appraisal_date)}</p>` : ``}</div> <div data-svelte-h="svelte-45iyy7"><label for="location" class="block w-full text-sm text-right uppercase">SAN JOSE C.R</label></div> <div data-svelte-h="svelte-11jcvtz"><label for="phone" class="block w-full text-sm text-right">Tel. 8794-4104</label></div></div></div></div>  <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-gray-100"><div><label for="cert" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1t452nx">No. de Certificado</label> <input id="cert" type="text" placeholder="NÚMERO DE CERTIFICADO" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" spellcheck="false"${add_attribute("value", formData.cert, 0)}></div> <div><label for="validity_days" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-k18gqj">Validez (días)</label> <input id="validity_days" type="number" min="1" placeholder="DÍAS" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.validity_days, 0)}></div> <div><label for="validity_kms" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1goq0rt">Validez (kilómetros)</label> <input id="validity_kms" type="number" min="1" placeholder="KM" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.validity_kms, 0)}></div></div></div>  <div class="p-6 border-b border-gray-200"><h2 class="text-lg font-semibold text-gray-800 mb-4" data-svelte-h="svelte-64pkz3">Información del Cliente</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><label for="applicant" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-10lg00r">Solicitante *</label> <input id="applicant" type="text" required placeholder="SOLICITANTE" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.applicant ? "border-red-500" : ""
  ].join(" ").trim()}" spellcheck="true" lang="es"${add_attribute("value", formData.applicant, 0)}> ${validationErrors?.applicant ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.applicant)}</p>` : ``}</div> <div><label for="owner" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1cpnzmh">Propietario</label> <input id="owner" type="text" placeholder="PROPIETARIO" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" spellcheck="true" lang="es"${add_attribute("value", formData.owner, 0)}></div></div></div>  <div class="p-6 border-b border-gray-200"><h2 class="text-lg font-semibold text-gray-800 mb-4 uppercase" data-svelte-h="svelte-jrjfog">Información del Vehículo</h2> <div class="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4"> <div class="md:col-span-1"><label for="brand" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-19o4y3z">Marca *</label> <input id="brand" type="text" required placeholder="MARCA" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.brand ? "border-red-500" : ""
  ].join(" ").trim()}" spellcheck="true" lang="es"${add_attribute("value", formData.brand, 0)}> ${validationErrors?.brand ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.brand)}</p>` : ``}</div> <div class="md:col-span-2"><label for="vehicle_description" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-6sr79b">Descripción/Modelo *</label> <input id="vehicle_description" type="text" ${requiredVehicleDescription ? "required" : ""} placeholder="MODELO" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.vehicle_description ? "border-red-500" : ""
  ].join(" ").trim()}" spellcheck="true" lang="es"${add_attribute("value", formData.vehicle_description, 0)}> ${validationErrors?.vehicle_description ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.vehicle_description)}</p>` : ``}</div> <div class="md:col-span-1"></div> <div class="md:col-span-1"><label for="model_year" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-13jl9qi">Año</label> <input id="model_year" type="number" min="1900"${add_attribute("max", (/* @__PURE__ */ new Date()).getFullYear() + 1, 0)} placeholder="AÑO" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.model_year, 0)}></div> <div class="md:col-span-1"><label for="color" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-15j1zem">Color</label> <input id="color" type="text" placeholder="COLOR" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" spellcheck="true" lang="es"${add_attribute("value", formData.color, 0)}></div> <div class="md:col-span-1"><label for="plate_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-z647m9">Placa</label> <input id="plate_number" type="text" placeholder="PLACA" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.plate_number, 0)}></div> <div class="md:col-span-1"><label for="mileage" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1npq465">Kilometraje</label> <input id="mileage" type="number" min="0" placeholder="KM" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.mileage, 0)}></div> <div class="md:col-span-1"><label for="fuel_type" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1jy4g3s">Combustible</label> <input id="fuel_type" type="text" placeholder="COMB." class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" spellcheck="true" lang="es"${add_attribute("value", formData.fuel_type, 0)}></div>  <div class="md:col-span-1"><label for="engine_size" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-s468bi">Cilindraje (cc)</label> <input id="engine_size" type="number" min="0" step="0.1" placeholder="CC" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", formData.engine_size, 0)}></div>  <div class="md:col-span-4"><label for="extras" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1h65qrg">Extras</label> <input id="extras" type="text" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" placeholder="EXTRAS" spellcheck="true" autocorrect="on" autocomplete="on" lang="es"${add_attribute("value", formData.extras, 0)}></div>   <div class="md:col-span-5"><label for="notes" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-az6p6u">Observaciones</label> <textarea id="notes" rows="2" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" placeholder="OBSERVACIONES..." spellcheck="true" autocorrect="on" autocomplete="on" lang="es">${escape(formData.notes || "")}</textarea></div></div></div>  <div class="p-6 border-b border-gray-200"><h2 class="text-lg font-semibold text-gray-800 mb-4 uppercase" data-svelte-h="svelte-nl96es">Verificación de Números</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><label for="vin" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-2bdks8">VIN (Físico)</label> <input id="vin" type="text" maxlength="17" placeholder="VIN FÍSICO" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.vin ? "border-red-500" : ""
  ].join(" ").trim()}"${add_attribute("value", formData.vin, 0)}> ${validationErrors?.vin ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.vin)}</p>` : ``}</div> <div><label for="vin_card" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1m6ftsi">Numero de VIN en Tarjeta</label> <input id="vin_card" type="text" maxlength="17" placeholder="VIN TARJETA" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.vin_card ? "border-red-500" : ""
  ].join(" ").trim()}"${add_attribute("value", formData.vin_card, 0)}> ${validationErrors?.vin_card ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.vin_card)}</p>` : ``}</div> <div><label for="engine_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-taelmg">No. Motor (Físico)</label> <input id="engine_number" type="text" maxlength="17" placeholder="MOTOR FÍSICO #" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.engine_number ? "border-red-500" : ""
  ].join(" ").trim()}"${add_attribute("value", formData.engine_number, 0)}> ${validationErrors?.engine_number ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.engine_number)}</p>` : ``}</div> <div><label for="engine_number_card" class="block text-xs font-medium text-gray-500 uppercase mb-0.5" data-svelte-h="svelte-1o6b2mv">Numero de Motor en Tarjeta</label> <input id="engine_number_card" type="text" maxlength="17" placeholder="MOTOR TARJETA #" class="${[
    "w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm",
    validationErrors?.engine_number_card ? "border-red-500" : ""
  ].join(" ").trim()}"${add_attribute("value", formData.engine_number_card, 0)}> ${validationErrors?.engine_number_card ? `<p class="text-red-500 text-xs mt-1">${escape(validationErrors.engine_number_card)}</p>` : ``}</div></div></div>  <div class="p-6 border-b border-gray-200"><h2 class="text-lg font-semibold text-gray-800 mb-4" data-svelte-h="svelte-9m58gx">Deducciones</h2> ${formData.deductions.length > 0 ? `<div class="space-y-4 mb-4">${each(formData.deductions, (deduction, index) => {
    return `<div class="flex items-center space-x-3"><div class="flex-grow grid grid-cols-2 gap-3"><input type="text" placeholder="${"Descripción Deducción #" + escape(index + 1, true)}" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" spellcheck="true" lang="es"${add_attribute("value", deduction.description, 0)}> <input type="number" placeholder="${"Monto Deducción #" + escape(index + 1, true)}" min="0" step="0.01" class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"${add_attribute("value", deduction.amount, 0)}></div> <button type="button" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 ease-in-out" aria-label="Eliminar deducción" data-svelte-h="svelte-1q3zmyi"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button> </div>`;
  })}</div>  <div class="mt-4 pt-4 border-t border-gray-200"><p class="text-md font-semibold text-gray-700 text-right">Total Deducciones:
          <span class="text-red-600">₡ ${escape(totalDeductions.toLocaleString("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }))}</span></p></div>` : ``} ${formData.deductions.length < 9 ? ` <button type="button" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm" data-svelte-h="svelte-uiq34d">Agregar Deducción</button>` : `<p class="text-sm text-gray-500 mt-4" data-svelte-h="svelte-stbmhi">Máximo de 9 deducciones alcanzado.</p>`}</div> <div class="p-6 border-b border-gray-200"><h2 class="text-lg font-semibold text-gray-800 mb-4" data-svelte-h="svelte-1i7h4vl">Valor del Avalúo</h2> <div class="flex items-center mb-4"><button type="button" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm" title="Establecer Valor Original" data-svelte-h="svelte-95mvd9"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-4"> <div><label for="apprasail_value_lower_bank" class="block text-xs font-medium text-gray-700 mb-1" data-svelte-h="svelte-2rwh72">Valor Garantía Bancaria</label> <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-100 text-gray-700 text-lg font-semibold text-center cursor-not-allowed">₡ ${escape(apprasail_value_lower_bank.toLocaleString("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }))}</div></div>  <div><label for="apprasail_value_lower_cost" class="block text-xs font-medium text-gray-700 mb-1" data-svelte-h="svelte-1oz1uxu">Valor Avalúo</label> <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-100 text-gray-700 text-lg font-semibold text-center cursor-not-allowed">₡ ${escape(apprasail_value_lower_cost.toLocaleString("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }))}</div> ${validationErrors?.appraisal_value_trochez ? `<p class="text-red-500 text-xs mt-1" data-svelte-h="svelte-1bghyyu">Error en Valor Avaluo Trochez (ver detalles)</p>` : ``}</div>  <div><label for="appraisal_value_usd" class="block text-xs font-medium text-gray-700 mb-1" data-svelte-h="svelte-2l202z">Valor (Dólares)</label> <input id="appraisal_value_usd" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-center"${add_attribute("value", formData.appraisal_value_usd, 0)}></div>  <div><label for="bank_value_in_dollars" class="block text-xs font-medium text-gray-700 mb-1" data-svelte-h="svelte-k37mqr">Valor Garantía Bancaria (USD)</label> <input id="bank_value_in_dollars" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-center" placeholder="0.00"${add_attribute("value", formData.bank_value_in_dollars, 0)}></div></div></div>  <div class="p-6 bg-gray-50 flex justify-end items-center space-x-4"><button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50" ${isSubmitting ? "disabled" : ""}>Cancelar</button> <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${isSubmitting ? "disabled" : ""}>${isSubmitting ? `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Guardando...` : `Guardar Avalúo`}</button></div></form>  ${``}`;
});
function getDefaultAvaluoFormData() {
  return {
    appraisal_date: "",
    // Default to empty, override in 'nuevo' if needed
    vehicle_description: "",
    brand: "",
    model_year: 0,
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
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user = null;
  let isSubmitting = false;
  let validationErrors = {};
  let formData = getDefaultAvaluoFormData();
  formData.appraisal_date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen bg-gray-50">${validate_component(Navbar, "Navbar").$$render($$result, { user }, {}, {})} <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="flex justify-between items-center mb-6" data-svelte-h="svelte-1n7a6jo"><h1 class="text-2xl font-bold text-gray-800">Nuevo Avalúo</h1></div> ${``} ${``} ${validate_component(AvaluoForm, "AvaluoForm").$$render(
      $$result,
      {
        validationErrors,
        isSubmitting,
        isEdit: false,
        formData
      },
      {
        formData: ($$value) => {
          formData = $$value;
          $$settled = false;
        }
      },
      {}
    )}</main></div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
