<template>
    <div class="relative">


        <div v-if="!state.loading" :style="style" class="relative pb-32">

            <div class="flex flex-nowrap justify-between items-start gap-2 py-2">
                <div v-if="isEdit">
                    <p v-if="state.item.c_status & 4" class="text-2xl text-info">Editar Coordinación {{ state.item.code
                        }}</p>
                    <div v-else-if="state.item.c_status & 2">
                        <p class="text-2xl text-info">Cancelada {{ state.item.code
                            }} </p>
                        <p>{{ state.item.cancelled_by }} - {{ state.item.cancelled_date_format }}</p>
                    </div>
                </div>
                <div v-else class="flex">
                    <div class="flex flex-col">
                        <p class="text-2xl text-info">Agregar <b class="font-bold text-brand">Coordinación
                                {{ state.item.code }}</b></p>
                        <p>Los campos requeridos tienen un (*)</p>
                    </div>
                    <div class="flex">
                        <q-option-group size="xs" :options="options.event_type" type="radio"
                            v-model="state.item.$event_type_id" />
                    </div>
                </div>
                <div class="flex gap-2">
                    <q-btn v-if="$me.unixroles & 3 && state.item.c_status & 2" flat
                        class="button bg-secondary text-white" label="Abrir Coordinación"
                        @click="onOpenEvent(state.item.id)"></q-btn>
                    <q-btn v-if="isDrawer" flat class="button" label="cerrar" @click="closeDialog"></q-btn>
                </div>
            </div>

            <div v-if="state.item.c_status & 2"
                class="absolute w-full h-full bg-black z-30 opacity-30 flex justify-center items-center">
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">CANCELADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">CANCELADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">CANCELADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">CANCELADA</div>
            </div>

            <div v-if="state.item.blocked && state.item.blocked_by_id !== $me.id"
                class="absolute w-full h-full bg-black z-30 opacity-30 flex justify-center items-center">
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">BLOQUEADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">BLOQUEADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">BLOQUEADA</div>
                <div class="text-8xl font-bold z-40 text-white transform -rotate-45">BLOQUEADA</div>
            </div>

            <div class="pb-20 pt-2">
                <q-form ref="writeForm" autofocus @submit="onSubmit" @reset="onReset" autocomplete="off"
                    autocorrect="off">
                    <div class="flex lg:flex-nowrap gap-1 py-1">

                        <div class="grid gap-2" :class="isDrawer ? 'lg:grid-cols-4' : 'lg:grid-cols-2'">
                            <div class="flex flex-col gap-1">

                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Asegurado
                                </div>
                                <InsuredSelect ref="mainInput" @setInsured="setInsured" @clearInsured="clearInsured"
                                    :model-value="state.item.insured" :id="state.item.insured_id" required />
                                <template v-if="state.item.insured_language">
                                    <div class="bg-default p-1 rounded-md flex justify-between font-bold text-xs">
                                        <span>Idiomas Asegurado</span>
                                    </div>
                                    <div class="flex gap-1">
                                        <q-badge v-for="language in state.item.insured_language" :key="language">
                                            {{ language }}
                                        </q-badge>
                                    </div>
                                </template>
                                <InsuranceSelect @setInsurance="setInsurance($event, row)"
                                    @clearInsurance="clearInsurance(row)"
                                    :model-value="state.item.insurance_description" />
                                <PolicySelect :readonly="!state.item.insured_id" @setPolicy="setPolicy($event, row)"
                                    @clearPolicy="clearPolicy(row)" :model-value="state.item.policy_number"
                                    :insuredId="state.item.insured_id" :insuranceId="state.item.insurance_id"
                                    :id="state.item.policy_id" />
                                <!-- <q-input readonly dense outlined v-model="state.item.policy_number"
                                    :label="$t('policy_number')" @keydown.enter.prevent></q-input> -->
                                <q-input readonly dense outlined v-model="state.item.insured_code"
                                    :label="$t('insured_code')" @keydown.enter.prevent
                                    @update:model-value="findInsuredCode"></q-input>
                                <q-input dense outlined v-model="state.item.ident_no" :label="$t('ident_no')"
                                    @keydown.enter.prevent @update:model-value="findByIdent"></q-input>
                                <q-input @keydown.enter.prevent dense outlined v-model="state.item.birthdate"
                                    mask="##-##-####" :label="$t('birthdate')">
                                    <template v-slot:append>
                                        <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy ref="proxy">
                                                <q-date flat v-model="state.item.birthdate" no-unset years-in-month-view
                                                    minimal mask="DD-MM-YYYY" @update:model-value="$refs.proxy.hide()"
                                                    :options="disableDatesBirthday">
                                                </q-date>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>

                                <template v-if="state.item.$sex_id === 6">
                                    <q-item class="q-pa-none" tag="label" v-ripple dense>
                                        <q-item-section side top>
                                            <q-checkbox v-model="state.item.pregnant" :true-value="1"
                                                :false-value="0" />
                                        </q-item-section>

                                        <q-item-section>
                                            <q-item-label class="uppercase text-xs">Embarazo</q-item-label>
                                        </q-item-section>

                                        <q-item-section v-if="state.item.pregnant && state.item.pregnant_start">
                                            <q-btn class="button text-[10px]" flat
                                                @click="state.dialogPregnant = true">Detalles</q-btn>
                                        </q-item-section>
                                    </q-item>

                                    <div v-if="state.item.pregnant" class="flex flex-nowrap gap-1 w-full">

                                        <q-input @keydown.enter.prevent class="w-full" dense outlined
                                            v-model="state.item.pregnant_start" mask="##-##-####"
                                            :label="$t('pregnant_start')">
                                            <template v-slot:append>
                                                <q-icon name="event" class="cursor-pointer">
                                                    <q-popup-proxy ref="proxy">
                                                        <q-date flat v-model="state.item.pregnant_start" no-unset
                                                            years-in-month-view minimal mask="DD-MM-YYYY"
                                                            @update:model-value="$refs.proxy.hide()"></q-date>
                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>

                                        <div class="grid grid-cols-2 gap-1">
                                            <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_left"
                                                @click="prevDate(state.item, 'pregnant_start')">
                                                <q-tooltip class="bg-default text-black text-xs">Día
                                                    anterior</q-tooltip>
                                            </q-btn>
                                            <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_right"
                                                @click="nextDate(state.item, 'pregnant_start')">
                                                <q-tooltip class="bg-default text-black text-xs">Día
                                                    siguiente</q-tooltip>
                                            </q-btn>
                                        </div>
                                    </div>
                                </template>

                                <div class="grid lg:grid-cols-1 gap-1">
                                    <div class="flex flex-col gap-1">
                                        <div class="bg-default p-1 rounded-md flex justify-between font-bold text-xs">
                                            <span>Fecha de solicitud</span>
                                            <span class="text-xxs">{{ request_date_format }}</span>
                                        </div>
                                        <div class="flex flex-nowrap gap-1 w-full">

                                            <q-input @keydown.enter.prevent class="w-full" dense outlined
                                                v-model="state.item.request_date" mask="##-##-####"
                                                label="Fecha de la solicitud">
                                                <template v-slot:append>
                                                    <q-icon name="event" class="cursor-pointer">
                                                        <q-popup-proxy ref="proxy">
                                                            <q-date flat v-model="state.item.request_date" no-unset
                                                                years-in-month-view minimal mask="DD-MM-YYYY"
                                                                @update:model-value="$refs.proxy.hide()"></q-date>
                                                        </q-popup-proxy>
                                                    </q-icon>
                                                </template>
                                            </q-input>

                                            <div class="grid lg:grid-cols-2 gap-1">
                                                <q-btn flat class="button-icon text-[10px] h-[40px]" icon="chevron_left"
                                                    @click="prevDate(state.item, 'request_date')">
                                                    <q-tooltip class="bg-default text-black text-xs">Día
                                                        anterior</q-tooltip>
                                                </q-btn>
                                                <q-btn flat class="button-icon text-[10px] h-[40px]"
                                                    icon="chevron_right" @click="nextDate(state.item, 'request_date')">
                                                    <q-tooltip class="bg-default text-black text-xs">Día
                                                        siguiente</q-tooltip>
                                                </q-btn>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Asignación
                                            de
                                            caso
                                        </div>

                                        <UserSelect @setUser="setUser" @clearUser="clearUser"
                                            :model-value="state.item.user_description" :id="state.item.user_id"
                                            :unixroles="24" />
                                    </div>
                                </div>
                                <q-item v-if="event_coordination" class="q-pa-none" tag="label" v-ripple dense>
                                    <q-item-section side top>
                                        <q-checkbox v-model="state.item.whatsapp_created" :true-value="1"
                                            :false-value="0" />
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label class="uppercase text-xs">Grupo de Whatsapp
                                            Creado</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <div class="grid grid-cols-1 gap-1">
                                    <div class="flex flex-col gap-1">
                                        <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Información
                                            de
                                            Contacto
                                            Asegurado</div>

                                        <q-input dense outlined v-model="state.item.phone"
                                            :label="$t('whatsapp_number')" @keydown.enter.prevent autocomplete="tel"
                                            inputmode="tel" autocorrect="off" spellcheck="false"></q-input>

                                        <q-input dense outlined v-model="state.item.email" :label="$t('email')"
                                            @keydown.enter.prevent></q-input>

                                        <q-input dense outlined v-model="state.item.address" :label="$t('address')"
                                            type="textarea" :rows="2"></q-input>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <template v-if="event_coordination">
                                            <div class="bg-default p-1 rounded-md text-center font-bold text-xs">
                                                Diagnósticos
                                                Presuntivo
                                                / Sintomatología
                                            </div>
                                            <q-input dense outlined v-model="state.item.symptoms"
                                                :label="$t('symptoms')" type="textarea" :rows="2"></q-input>
                                            <q-input @keydown.enter.prevent class="w-full" dense outlined
                                                v-model="state.item.symptoms_date" mask="##-####"
                                                :label="`${$t('symptoms_date')} MM-YYYY`">
                                            </q-input>
                                            <DiagnosisSelect @setDiagnosis="setPresumptiveDiagnosis"
                                                @clearDiagnosis="clearPresumptiveDiagnosis"
                                                :model-value="state.item.presumptive_diagnosis_description" />
                                        </template>
                                    </div>
                                </div>



                                <div class="flex flex-nowrap gap-1"
                                    v-for="(item, index) in state.item.presumptive_diagnosis" :key="item.id">
                                    <div
                                        class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                        {{ index + 1 }}</div>
                                    <div class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.description }}</div>
                                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.code }}</div>
                                    </div>
                                    <q-btn diabled flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                        icon="fa-solid fa-xmark" @click="removeDiagnosisPresumtive(item.id)">
                                        <q-tooltip class="bg-default text-black text-xs">Remover diagnóstico</q-tooltip>
                                    </q-btn>
                                </div>

                            </div>

                            <div class="flex flex-col gap-1">

                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Localidad del
                                    Centro
                                </div>
                                <CountrySelect @setCountry="setCountry" @clearCountry="clearCountry"
                                    :model-value="state.item.country" :readonly="!!state.item.state_id" />
                                <StateSelect :refId="state.item.country_id" @setState="setState"
                                    @clearState="clearState" :model-value="state.item.state"
                                    :readonly="!!state.item.city_id" />
                                <CitySelect :refId="state.item.state_id" @setCity="setCity" @clearCity="clearCity"
                                    :model-value="state.item.city" />
                                <div v-if="state.item.country" class="card py-1 px-2 mb-1 flex flex-col">
                                    <span>Hora en <b class="text-primary">{{ state.item.time_zone }}</b></span>
                                    <span>{{ state.countryDateTime }}</span>
                                </div>
                                <!-- <CategorySelect class="mb-2" :model-value="state.item.lodging" refKey="lodging"
                                    @setCategory="state.item.$lodging_id = $event"
                                    @clearCategory="state.item.$lodging_id = null" add /> -->
                                <LodgingSelect class="w-full" @setLodging="setLodging" @clearLodging="clearLodging"
                                    :model-value="state.item.lodging_description" :id="state.item.lodging_id"
                                    :countryId="state.item.country_id" :stateId="state.item.state_id" add />
                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Fechas
                                    deseadas
                                </div>

                                <div class="flex flex-col gap-2">

                                    <q-date class="card w-full" ref="desirable_dates" flat
                                        v-model="state.item.desirable_dates" range multiple
                                        @navigation="onDatePickerNavigation" years-in-month-view minimal
                                        :events="state.holidaysDates" event-color="orange" :options="disableDates" />

                                    <div class="flex flex-col text-xs">
                                        <div class="flex flex-nowrap gap-1 mb-1"
                                            v-for="(d, index) in state.item.desirable_dates" :key="d">
                                            <template v-if="d?.from">
                                                <!-- <div
                                                    class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                                    {{ index + 1 }}</div> -->
                                                <div
                                                    class="w-full flex flex-start items-center justify-between border card shadow-none px-3 py-1">
                                                    <div class="uppercase pr-4 line-clamp-1">{{ format(d.from,
                                                        'EEE dd MMM yyyy')
                                                    }} - {{ format(d.to,
                                                            'EEE dd MMM yyyy') }}
                                                    </div>
                                                </div>
                                            </template>
                                            <template v-else>
                                                <div
                                                    class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                                    {{ index + 1 }}</div>
                                                <div
                                                    class="w-full flex flex-start items-center justify-between border card shadow-none px-3 py-1">
                                                    <div class="flex flex-col">
                                                        <div class="uppercase pr-4 line-clamp-1">{{ format(d,
                                                            'EEE dd MMM yyyy') }}
                                                        </div>
                                                        <div v-html="getHolidayText(d)"></div>
                                                    </div>
                                                </div>
                                            </template>
                                            <q-btn flat class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                                icon="fa-solid fa-xmark" @click="removeDateRange(index)">
                                            </q-btn>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">COMENTARIO
                                    PREFERENCIAS
                                    CLIENTE
                                </div>

                                <q-input dense outlined v-model="state.item.comment" :label="$t('comment')"
                                    type="textarea" :rows="4"></q-input>

                            </div>

                            <div>
                                <div class="flex flex-col gap-1">

                                    <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Proveedor
                                    </div>
                                    <ProviderSelect class="w-full" @setProvider="setProvider"
                                        @clearProvider="clearProvider" :model-value="state.item.provider_description"
                                        :id="state.item.provider_id" :countryId="state.item.country_id"
                                        :stateId="state.item.state_id" add />
                                    <ContactSelect @setContact="setContact" @clearContact="clearContact"
                                        :model-value="state.item.contact_description" :id="state.item.contact_id"
                                        :providerId="state.item.provider_id" />
                                    <q-input dense outlined v-model="state.item.MRN" :label="$t('MRN')"
                                        @keydown.enter.prevent></q-input>
                                    <div class="mb-1 flex flex-col gap-1">
                                        <div class="bg-default p-1 rounded-md text-center font-bold text-xs">
                                            Diagnósticos
                                        </div>
                                        <DiagnosisSelect @setDiagnosis="setDiagnosis" @clearInsured="clearDiagnosis"
                                            :model-value="state.item.diagnosis_description" />
                                    </div>
                                    <div class="flex flex-nowrap gap-1" v-for="(item, index) in state.item.diagnosis"
                                        :key="item.id">
                                        <div
                                            class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                            {{ index + 1 }}</div>
                                        <div
                                            class="w-full flex flex-col justify-between border card shadow-none px-3 py-1">
                                            <div class="text-xs uppercase pr-4 line-clamp-1" :title="item.description">
                                                {{ item.description }}
                                                <q-popup-proxy>
                                                    <q-banner>
                                                        {{ item.description }}
                                                    </q-banner>
                                                </q-popup-proxy>
                                            </div>
                                            <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.code }}</div>
                                        </div>
                                        <q-btn diabled flat
                                            class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                            icon="fa-solid fa-xmark" @click="removeDiagnosis(item.id)">
                                            <q-tooltip class="bg-default text-black text-xs">Remover
                                                diagnóstico</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-1">
                                    <!-- <q-btn flat class="button bg-secondary text-white w-full" no-caps
                                        @click="state.itineraryDialog = true" label="+ itinerario">
                                        <q-tooltip class="bg-default text-black text-xs">Listado de
                                            Itinerarios</q-tooltip>
                                    </q-btn> -->


                                    <q-date class="card w-full" ref="itinerary_dates" flat
                                        :model-value="state.item.itinerary_dates" multiple
                                        @navigation="onDatePickeItinerary" years-in-month-view minimal
                                        :events="state.holidaysDates" event-color="orange"
                                        :options="disableDatesItinerary" />

                                    <!-- <div class="flex flex-col text-xs">
                                        <div class="flex flex-nowrap gap-1 mb-1"
                                            v-for="(d, index) in state.item.itinerary" :key="d">
                                            <div
                                                class="w-full flex flex-start items-center justify-between border card shadow-none px-3 py-1">
                                                <div class="flex flex-col">
                                                    <div class="uppercase pr-4 line-clamp-1">{{
                                                        format(d.attendance_date_format,
                                                            'EEE dd MMM yyyy') }}, {{ d.attendance_time }} {{
                                                            d.attendance_time_format }}
                                                    </div>
                                                    <div>P: {{ d.provider_description }}</div>
                                                    <div>M: {{ d.doctor_description }}</div>
                                                    <div class="bg-stone-100 rounded text-xxs px-2">Procedimientos</div>
                                                    <div class="flex flex-nowrap gap-1"
                                                        v-for="(item, index) in d.mprocedure" :key="item.id">
                                                        <div
                                                            class="w-full flex flex-col justify-between border card shadow-none px-3 py-1 text-xxs">
                                                            <div class="text-xs uppercase pr-4 line-clamp-1">{{
                                                                item.description
                                                                }}
                                                            </div>
                                                            <div class="text-xs uppercase pr-4 line-clamp-1">{{
                                                                item.code }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-1">
                                                <q-btn flat
                                                    class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                                    icon="fa-solid fa-pencil"
                                                    @click="state.selectedItinerary = d.id; state.dialogWriteItinerary = true">
                                                </q-btn>
                                                <q-btn flat
                                                    class="button-icon bg-primary text-white text-[10px] h-[40px]"
                                                    icon="fa-solid fa-xmark" @click="removeRowItinerary(d)">
                                                </q-btn>
                                            </div>
                                        </div>
                                    </div> -->

                                </div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">
                                    Estado
                                </div>

                                <div class="grid grid-cols-2 gap-4">

                                    <div>
                                        <q-option-group size="xs" :options="options.event_state.slice(0, 4)"
                                            type="radio" v-model="state.item.$event_state_id">
                                            <template v-slot:label="opt">
                                                <div class="flex flex-nowrap items-center justify-between w-full">

                                                    <span class="text-xs">{{ opt.label }}</span>

                                                    <q-badge :style="{ background: opt.color }"
                                                        class="flex justify-center font-bold text-xxs ml-2">
                                                        {{ opt.event_category }}
                                                    </q-badge>
                                                </div>
                                            </template>
                                        </q-option-group>
                                    </div>
                                    <div>
                                        <q-option-group size="xs" :options="options.event_state.slice(4)" type="radio"
                                            v-model="state.item.$event_state_id">
                                            <template v-slot:label="opt">
                                                <div class="flex flex-nowrap items-center justify-between w-full">

                                                    <span class="text-xs">{{ opt.label }}</span>

                                                    <q-badge :style="{ background: opt.color }"
                                                        class="flex justify-center font-bold text-xxs ml-2">
                                                        {{ opt.event_category }}
                                                    </q-badge>
                                                </div>
                                            </template>
                                        </q-option-group>
                                    </div>
                                </div>

                                <div class="bg-default p-1 rounded-md text-center font-bold text-xs">Pendientes</div>
                                <div class="flex flex-nowrap items-center gap-1" v-for="(item, index) in pendingList"
                                    :key="item.id">

                                    <div
                                        class="w-full max-w-[40px] min-w-[40px] flex justify-center items-center border card shadow-none">
                                        {{ index + 1 }}</div>
                                    <div class="w-full flex items-center border card shadow-none px-3 py-1">
                                        <div class="text-xs uppercase pr-4 line-clamp-1">{{ item.text }}</div>
                                    </div>
                                    <q-badge :color="item.color" :style="{ background: item.color }"
                                        class="flex justify-center font-bold text-xxs w-[16px] h-[16px]"></q-badge>
                                </div>
                                <template v-if="isEdit">
                                  <q-btn flat class="button-icon h-[40px] bg-secondary text-white"
                                      @click="state.cancelDialog = true" label="Cancelar coordinación">
                                      <q-tooltip class="bg-default text-black text-xs">Cancelar
                                          coordinación</q-tooltip>
                                  </q-btn>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div class="bg-default p-1 rounded-md text-center font-bold text-xs mb-1">Itinerarios</div>
                    <EventItinerary isEdit :id="state.item.id" @setItems="setItinerary" isDrawer
                        @close="state.itineraryDialog = false" hideDetail />
                    <div class="flex flex-col w-full mb-2">
                      <template v-if="!state.loading">
                          <CommentTable refKey="t_event" :grid="false" :refId="state.item.id" :comment_state="state.item.event_state"
                              :comment_state_id="state.item.$event_state_id" />
                      </template>
                    </div>
                    <template v-if="isEdit">
                      <UploadFileManager :ref_id="state.item.id" table="t_event" file_type="GENERAL" />
                      <FileManager :refId="state.item.id" refKey="t_event" />
                    </template>
                    <template v-if="!(state.item.blocked && state.item.blocked_by_id !== $me.id)">
                        <template v-if="!(state.item.c_status & 2)">
                            <div v-if="isDrawer" class="fixed bottom-0 lg:right-[10px] right-0 py-2 bg-white"
                                :style="style">
                                <RowStatus :item="state.item" :isEdit="isEdit" />
                                <div class="flex flex-nowrap gap-2 lg:ml-[10px] mt-1">
                                    <template v-if="props.isEdit">
                                        <q-btn class="button-icon bg-primary text-white py-0" icon="fa-solid fa-xmark"
                                            rounded @click.stop="onDelete(state.item.id)" size="sm"><q-tooltip
                                                class="bg-default text-black" size="xs">Remover</q-tooltip></q-btn>
                                        <q-btn class="button-press w-full text-lg rounded-md bg-primary text-white" flat
                                            label="guardar cambios" type="submit" />
                                    </template>
                                    <q-btn v-else class="button-press w-full text-lg rounded-md bg-primary text-white"
                                        flat label="guardar cambios" type="submit" />
                                </div>
                            </div>
                            <div v-else>
                                <q-btn v-if="props.isEdit" class="button-press w-full text-lg rounded-md" flat
                                    label="Guardar cambios" type="submit" />
                                <q-btn v-else class="button-press w-full text-lg rounded-md" flat label="agregar"
                                    type="submit" />
                            </div>
                        </template>
                    </template>
                </q-form>
            </div>
        </div>
    </div>
    <q-dialog v-model="state.dialogRemove">
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <q-form @submit="recoverPassword">
                <div class="font-bold text-lg text-font">Remover Coordinación</div>
                <div class="flex justify-end pt-4">
                    <q-btn class="button mr-2" flat label="Cancelar" @click="state.dialogRemove = false" />
                    <q-btn class="button-press bg-primary text-white w-[120px]" flat label="Enviar"
                        @click="removeEvent" />
                </div>
            </q-form>
        </q-card>
    </q-dialog>
    <!-- <q-dialog v-model="state.itineraryDialog" full-height full-width>
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <EventItinerary isEdit :id="state.item.id" @setItems="setItinerary" isDrawer
                @close="state.itineraryDialog = false" @update="setItinerary" />
        </q-card>
    </q-dialog> -->
    <q-dialog v-model="state.dialogPregnant" full-height full-width>
        <q-card class="shadow pt-4 px-6 pb-4 flex-col w-[400px]">
            <InsuredPregnant isEdit :id="state.item.id" :pregnant_data="state.item.pregnant_data"
                :pregnant_start="state.item.pregnant_start" @setItems="setItinerary" isDrawer
                @close="state.dialogPregnant = false" />
        </q-card>
    </q-dialog>
    <q-dialog class="q-pa-none left-0" v-model="state.dialogWriteItinerary"
        :position="$isDesktop ? 'right' : 'standard'" full-height maximized :transition-duration="$isDesktop ? 100 : 0">
        <q-card>
            <EventWriteItinerary isDrawer @submit="state.dialogWriteItinerary = false"
                @close="state.dialogWriteItinerary = false; getItineraries()" isEdit :id="state.selectedItinerary"
                :width="$isDesktop ? '400px' : '100%'" />
        </q-card>
    </q-dialog>
    <q-dialog v-model="state.cancelDialog">
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">Deseas cancelar esta Coordinación?</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <CategorySelect class="mb-2" :model-value="state.item.reason_cancellation" refKey="reason_cancellation"
                    @setCategory="state.item.$reason_cancellation_id = $event"
                    @clearCategory="state.item.$reason_cancellation_id = null" add />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
                <q-btn :disabled="!state.item.$reason_cancellation_id" flat label="Aceptar y cancelar" v-close-popup
                    @click="onCancelEvent" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { vMaska } from 'maska'
import { maskaNumberToken, maskaNumber } from 'src/helpers/mask'
import { addDays, format, getMinutes, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { computed, inject, nextTick, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
const $api = inject('$api');
const $cats = inject('$cats');
const $me = inject('$me');
const $q = useQuasar()
const writeForm = ref();
const mainInput = ref();

import CommentTable from 'src/pages/comment/components/CommentTable.vue';
import RowStatus from 'src/components/RowStatus.vue';
import ProviderSelect from 'src/components/select/ProviderSelect.vue';
import DiagnosisSelect from 'src/components/select/DiagnosisSelect.vue';
import CategorySelect from 'src/components/select/CategorySelect.vue';
import UploadFileManager from 'src/components/file/UploadFileManager.vue';
import FileManager from 'src/components/file/FileManager.vue';
import UserSelect from 'src/components/select/UserSelect.vue';
import ContactSelect from 'src/components/select/ContactSelect.vue';
import { convertDateFormat, readableDate } from 'src/helpers/date';
import { disableDates, disableDatesBirthday } from 'src/helpers';
import InsuranceSelect from 'src/components/select/InsuranceSelect.vue';
import EventItinerary from './EventItinerary.vue';

import CountrySelect from 'src/components/select/CountrySelect.vue';
import CitySelect from 'src/components/select/CitySelect.vue';
import StateSelect from 'src/components/select/StateSelect.vue';
import { useInputDate } from 'src/use/inputDate'
import InsuredSelect from 'src/components/select/InsuredSelect.vue';
import EventWriteItinerary from './EventWriteItinerary.vue';
import InsuredPregnant from 'src/pages/insured/components/InsuredPregnant.vue';
import pregnant from 'src/data/pregnant';
import PolicySelect from 'src/components/select/PolicySelect.vue';
import LodgingSelect from 'src/components/select/LodgingSelect.vue';
const props = defineProps({
    id: Number, copyId: Number, isEdit: Boolean, timestamp: Object, user: Object, userId: Number, insuredId: Number, unixroles: Number, width: String, isDrawer: Boolean
})
const $emit = defineEmits(['submit', 'close'])

const initialItem = () => ({
    pregnant: 0,
    pregnant_data: {},
    interval_clock: null,
    time_zone: null,
    is_sent_to_provider: 0,
    whatsapp_created: 0,
    $currency_id: 14,
    itinerary: [],
    itinerary_dates: [],
    VOB: 0,
    medical_guide: 0,
    diagnosis: [],
    presumptive_diagnosis: [],
    mprocedure: [],
    $mprocedure_pivot_id: null,
    attendance_time: null,
    attendance_time_format: 'AM',
    event_reason: '',
    alert: 0,
    $event_state_id: 30,
    $event_type_id: $me.unixroles & 16 ? 176 : 178,
    weekdays: [],
    unixroles: props.unixroles,
    recurrent: 0,
    saturday: 0,
    end_date: null,
    start_time: null,
    end_time: null,
    contact_description: '',
    user_id: $me.id,
    user_description: $me.description,

})
const options = reactive({
    insurances: [],
    insureds: [],
    event_state: $cats.value.event_state,
    event_type: $cats.value.event_type,
    lodging: $cats.value.lodging,
    colors: $cats.value.event_state.map(i => i.color),
})

const state = reactive({
    timeout: null,
    selectedItinerary: {},
    dialogWriteItinerary: false,
    itineraryDialog: false,
    countryDateTime: null,
    minDate: format(new Date(), 'yyyy-MM'),
    desirableDatesYear: null,
    holidays: [],
    holidaysDates: [],
    loading: true,
    isValidTime: true,
    searchUser: null,
    searchService: null,
    services: [],
    submitting: false,
    blockIdentAutocomplete: false,
    users: [],
    dialogRemove: false,
    insureds: [],
    intervals: 15,
    item: initialItem(),
    insurances: [],
    // start: props.date,
    queryUser: {
        odir: 'DESC',
        order: 'description',
        join: ['t_user_contact'],
        where: {
            c_status: 4,
            'bi:unixroles': props.unixroles,
            c_status: 20,
        },
        return: {
            items: true
        }
    },
    loading: true
})

const { addMinutes, subtractMinutes, nextDate, prevDate } = useInputDate(state)

const event_coordination = computed(() => {
    return state.item.$event_type_id === 178
})

const pendingList = computed(() => {
    const list = []
    if (state.item.$event_state_id >= 30) {
        // if (!state.item.whatsapp_created) {
        //     list.push({
        //         text: 'Crear grupo de whatsapp',
        //         color: options.colors[0]
        //     })
        // }
        if (!state.item.phone) {
            list.push({
                text: 'Agregar número de whatsapp',
                color: options.colors[0]
            })
        }
        if (!state.item.email) {
            list.push({
                text: 'Agregar email',
                color: options.colors[0]
            })
        }
        if (!state.item.address) {
            list.push({
                text: 'Agregar dirección',
                color: options.colors[0]
            })
        }
        if (!state.item.insured_id) {
            list.push({
                text: 'Agregar asegurado',
                color: options.colors[0]
            })
        }
    }
    if (state.item.$event_state_id >= 31) {
        if (!state.item.user_id) {
            list.push({
                text: 'Asignar usuario a caso',
                color: options.colors[1]
            })
        }
    }
    if (state.item.$event_state_id < 32) {
        // if (!state.item.presumptive_provider_id) {
        //     list.push({
        //         text: 'Asignar proveedor presuntivo',
        //         color: options.colors[0]
        //     })
        // }
        if (!state.item.desirable_dates?.length) {
            list.push({
                text: 'Asignar fechas deseadas',
                color: options.colors[0]
            })
        }
        if (!state.item.symptoms) {
            list.push({
                text: 'Agregar síntomas',
                color: options.colors[0]
            })
        }
        if (!state.item.presumptive_diagnosis) {
            list.push({
                text: 'Agregar diagnóstico presuntivo',
                color: options.colors[0]
            })
        }
    }

    if (state.item.$event_state_id >= 37) {
        if (!state.item.diagnosis?.length) {
            list.push({
                text: 'Agregar diagnóstico',
                color: options.colors[3]
            })
        }

        if (state.item.itinerary && state.item.itinerary.length) {
            for (let i = 0; i < state.item.itinerary.length; i++) {
                const itinerary = state.item.itinerary[i];
                if (!itinerary.attendance_date) {
                    list.push({
                        text: 'Fecha de atención',
                        color: options.colors[3]
                    })
                }
                if (!itinerary.attendance_time && itinerary.attendance_time_format) {
                    list.push({
                        text: 'Hora de atención',
                        color: options.colors[3]
                    })
                }
                if (!itinerary.doctor_id) {
                    list.push({
                        text: 'Agregar Médico',
                        color: options.colors[3]
                    })
                }
                if (!itinerary.mprocedure && !itinerary.mprocedure.length) {
                    list.push({
                        text: 'Agregar Procedimientos CPT',
                        color: options.colors[3]
                    })
                }
            }
        }

        if (!state.item.provider_id) {
            list.push({
                text: 'Agregar proveedor',
                color: options.colors[3]
            })
        }

        if (!state.item.contact_id) {
            list.push({
                text: 'Agregar contacto',
                color: options.colors[3]
            })
        }

        if (!state.item.MRN) {
            list.push({
                text: 'Agregar MRN',
                color: options.colors[3]
            })
        }
        if (!state.item.ROI_file?.url) {
            list.push({
                text: 'Agregar ROI (Archivo)',
                color: options.colors[3]
            })
        }

        // if (!state.item.HIPAA_file?.url) {
        //     list.push({
        //         text: 'Agregar HIPAA (Archivo)',
        //         color: options.colors[3]
        //     })
        // }

        // if (!state.item.mprocedure_pivot_id) {
        //     list.push({
        //         text: 'Agregar Procedimiento PIVOT',
        //         color: options.colors[3]
        //     })
        // }

    }

    if (state.item.$event_state_id >= 38) {
        if (!state.item.VOB_file?.url) {
            list.push({
                text: 'Agregar VOB (Archivo)',
                color: options.colors[4]
            })
        }
    }

    if (state.item.$event_state_id >= 39) {
        if (!state.item.medical_guide_file?.url) {
            list.push({
                text: 'Agregar Guía médica (Archivo)',
                color: options.colors[5]
            })
        }
    }

    return list;
})

watch(() => state.item.pregnant, (val) => {
    if (val) {
        state.item.pregnant_data = pregnant
    } else {
        state.item.pregnant_data = null
    }
})

watch(() => state.item.$event_type_id, (val) => {
    try {
        if (val === 176) {
            setCountry(62)
        } else {
            clearCountry()
        }
    } catch (error) {
        console.log(error);
    }
})

watch(() => state.item.user_id, async (val) => {
    const index = state.users.findIndex(i => i.id === val)
    if (index !== -1) {
        state.item.user_description = state.users[index].description
    }
})

function disableDatesItinerary(date) {
    try {
        for (let i = 0; i < state.item.itinerary?.length; i++) {
            const _itinerary = state.item.itinerary[i];
            if (_itinerary.attendance_date_format === date) {
                return true
            }
        }
        return date >= format(new Date(), 'yyyy/MM/dd')
    } catch (error) {
        console.log(error);
    }
}

watch(() => state.item.itinerary, async (val) => {
    if (state.item.itinerary) {
        state.item.itinerary_dates = state.item.itinerary.map(i => {
            if (!i.attendance_date_format) {
                i.attendance_date_format = convertDateFormat(i.attendance_date)
            }
            return i.attendance_date_format
        })
    }
}, { deep: true })

const request_date_format = computed(() => {
    return readableDate(state.item.request_date)
})

const attendance_date_format = computed(() => {
    return readableDate(state.item.attendance_date)
})

async function setItinerary(items) {
    try {
        clearTimeout(state.timeout)
        state.timeout = setTimeout(async () => {
            const _items = items.filter(i => {
                return i.attendance_date && i.attendance_time
            })

            if (props.isEdit) {
                for (let i = 0; i < _items.length; i++) {
                    const item = _items[i];
                    if (item.event_id) {
                        console.log(1, item.provider_description, item.event_id);
                        $api.put(`itinerary/${item.id}`, item)
                    } else {
                        item.event_id = props.id;
                        console.log(2, item.event_id);
                        const res = await $api.post(`itinerary`, item);
                        item.id = res.id
                    }

                }
            }

            state.item.itinerary = _items;
        }, 1000)

    } catch (error) {
        console.log(error);
    }
}

function getHolidayText(d) {

    const [holiday] = state.holidays.filter((i) => {
        return isSameDay(d.replace(/\//g, '-'), i.date.iso)
    })
    if (holiday?.name) {
        return holiday.name
    } else {
        return;
    }
}

function onDatePickerNavigation(event) {
    state.desirableDatesYear = event.year
    setHolidays(state.item.country_iso2, event.year)
}

function onDatePickeItinerary(event) {
    state.desirableDatesYear = event
}

async function setHolidays(country) {
    state.holidays = await $api.get(`resources/calendarific`, {
        params: {
            country
        }
    });
    if (state.holidays) {
        state.holidaysDates = state.holidays.map((item) => {
            return format(parseISO(item.date.iso), 'yyyy/MM/dd')
        })
    } else {
        state.holidaysDates = []
    }
}

function getCurrentTime(timeZone) {
    state.interval_clock = setInterval(() => {
        state.countryDateTime = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(new Date());
    }, 1000);
}

async function setCountry(id) {
    try {
        const country = await $api.get(`utility/countries/${id}`)
        if (country.timezones) {

        }
        state.item.country_id = country.id;
        state.item.country = country.description;
        state.item.country_iso2 = country.iso2;

        // state.item.nationality = nationalities[country.nationality];
        setHolidays(country.iso2, state.desirableDatesYear)
    } catch (error) {
        console.log(error);
    }
}

function clearCountry() {
    try {
        state.item.state_id = null;
        state.item.state = null;
        state.item.country_id = null;
        state.item.country = null;
        state.item.city_id = null;
        state.item.city = null;
        state.holidaysDates = []
    } catch (error) {
        console.log(error);
    }
}

async function setCity(id) {
    try {
        const city = await $api.get(`utility/cities/${id}`)

        getTimeZone(city)

        state.item.city_id = city.id;
        state.item.city = city.description;
    } catch (error) {
        console.log(error);
    }
}

async function getTimeZone(city) {
    const timezoneJSON = await $api.get(`resources/geonames/timezoneJSON`, {
        params: {
            lat: city.latitude,
            lng: city.longitude,
        }
    })
    if (timezoneJSON?.timezoneId) {
        state.item.time_zone = timezoneJSON.timezoneId
        getCurrentTime(timezoneJSON.timezoneId)
    }
}

function clearCity() {
    try {
        state.item.city_id = null;
        state.item.city = null;
    } catch (error) {
        console.log(error);
    }
}

async function setState(id) {
    try {
        const _state = await $api.get(`utility/states/${id}`)
        console.log(_state);
        state.item.state_id = _state.id;
        state.item.state = _state.description;
    } catch (error) {
        console.log(error);
    }
}

async function setInsurance(id, row) {
    try {

        const insurance = await $api.get(`insurance/${id}`)

        state.item.insurance_id = insurance.id;
        state.item.insurance_description = insurance.description;

    } catch (error) {
        console.log(error);
    }
}

function clearInsurance() {
    try {
        state.item.insurance_id = null;
        state.item.insurance_description = null;
        clearPolicy()
    } catch (error) {
        console.log(error);
    }
}

async function setPolicy(id) {
    try {

        const policies = await $api.get(`policy`, {
            params: {
                join: [{ table: 't_policy_insured', relationA: 't_policy.id', relationB: 't_policy_insured.policy_id' }],
                groupBy: ['t_policy.id'],
                where: {
                    insured_id: id,
                    't_policy.c_status': 4,
                    $insured_type_id: [],
                },
                columns: {
                    t_policy: ['*'],
                    t_insured: ['fullname']
                },
                returnItems: true
            }
        })

        if (policies.length) {
            const policy = policies[0];

            state.item.insurance_id = policy.insurance_id;
            state.item.insurance_description = policy.insurance;
            state.item.insured_code = policy.insured_code
            state.item.policy_id = policy.id
            state.item.policy_number = policy.policy_number
        }

    } catch (error) {
        console.log(error);
    }
}

function clearPolicy() {
    try {
        state.item.insurance_id = null;
        state.item.insurance_description = null;
        state.item.insured_code = null
        state.item.policy_id = null
        state.item.policy_number = null
    } catch (error) {
        console.log(error);
    }
}

function clearState() {
    try {
        state.item.state_id = null;
        state.item.state = null;
        state.item.city_id = null;
        state.item.city = null;
    } catch (error) {
        console.log(error);
    }
}

async function findByIdent() {
    if (props.isEdit) {
        return;
    }

    if (state.item.ident_no) {
        const ident_no = state.item.ident_no.replace(/\D/g, '');
        if (ident_no.length === 11) {
            const result = await $api.get(`utility/cedulados/${ident_no}`);
            if (result.birthdate) {
                state.item.birthdate = result.birthdate;
            }
            state.item.contact_description = result.description;
            state.item.$sex_id = result.$sex_id;


            const [insured] = await $api.get('insured', {
                params: {
                    where: {
                        c_status: 4,
                        ident_no
                    },
                    returnItems: true
                }
            });

            if (insured) {
                setInsured(insured)
            }

        } else {
            state.item.birthdate = null;
            state.item.$sex_id = null;
        }
    }
}

async function findInsuredCode() {
    if (props.isEdit) {
        return;
    }

    const [policy] = await $api.get('policy', {
        params: {
            where: {
                insured_code: state.item.insured_code,
                c_status: 4,
            },
            returnItems: true
        }
    });

    if (policy) {
        setInsured(policy.insured_id)
    }

}

function removeDateRange(index) {
    try {
        state.item.desirable_dates.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

async function setPresumptiveDiagnosis(id) {
    try {
        const diagnosis = await $api.get(`ICD10/${id}`)
        if (!state.item.presumptive_diagnosis) {
            state.item.presumptive_diagnosis = []
        }
        const index = state.item.presumptive_diagnosis.findIndex((i) => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Diagnóstico ya esta agregado'
            })
        }
        state.item.presumptive_diagnosis.push({
            id: String(diagnosis.id),
            code: diagnosis.code,
            description: diagnosis.description
        })

        state.item.presumptive_diagnosis_description = null;
        state.item.presumptive_diagnosis_id = null;

    } catch (error) {
        console.log(error);
    }
}

function clearPresumptiveDiagnosis() {
    try {
        state.item.presumptive_diagnosis_id = null;
        state.item.presumptive_diagnosis_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setDiagnosis(id) {
    try {
        const diagnosis = await $api.get(`ICD10/${id}`)
        if (!state.item.diagnosis) {
            state.item.diagnosis = []
        }
        const index = state.item.diagnosis.findIndex((i) => i.id === id)
        if (index !== -1) {
            $q.notify({
                type: 'warning',
                message: 'Diagnóstico ya esta agregado'
            })
        }
        state.item.diagnosis.push({
            id: String(diagnosis.id),
            code: diagnosis.code,
            description: diagnosis.description
        })

        state.item.diagnosis_description = null;
        state.item.diagnosis_id = null;

    } catch (error) {
        console.log(error);
    }
}

function clearDiagnosis() {
    try {
        state.item.diagnosis_id = null;
        state.item.diagnosis_description = null;
    } catch (error) {
        console.log(error);
    }
}

function removeDiagnosis(id) {
    try {
        const index = state.item.diagnosis.findIndex((i) => i.id === id)
        state.item.diagnosis.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

function removeDiagnosisPresumtive(id) {
    try {
        const index = state.item.presumptive_diagnosis.findIndex((i) => i.id === id)
        state.item.presumptive_diagnosis.splice(index, 1)
    } catch (error) {
        console.log(error);
    }
}

async function setProvider(id) {
    try {
        const provider = await $api.get(`provider/${id}`)
        state.item.provider_id = String(provider.id);
        state.item.provider_description = provider.description;
        console.log(provider);
        if (!state.item.country) {
            setCountry(provider.country_id)
        }
        if (!state.item.state_id) {
            setState(provider.state_id)
        }
        if (!state.item.city_id) {
            setCity(provider.city_id)
        }
    } catch (error) {
        console.log(error);
    }
}

function clearProvider(row) {
    try {
        state.item.provider_id = null;
        state.item.provider_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setLodging(id) {
    try {
        const lodging = await $api.get(`lodging/${id}`)
        state.item.lodging_id = String(lodging.id);
        state.item.lodging_description = lodging.description;
    } catch (error) {
        console.log(error);
    }
}

function clearLodging(row) {
    try {
        state.item.lodging_id = null;
        state.item.lodging_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setUser(id) {
    try {
        const user = await $api.get(`user/${id}`)
        state.item.user_id = user.id;
        state.item.user_description = user.description;

    } catch (error) {
        console.log(error);
    }
}

function clearUser(row) {
    try {
        state.item.user_id = null;
        state.item.user_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setContact(id) {
    try {
        const contact = await $api.get(`contact/${id}`)
        state.item.contact_id = contact.id;
        state.item.contact_description = contact.description;

    } catch (error) {
        console.log(error);
    }
}

function clearContact(row) {
    try {
        state.item.contact_id = null;
        state.item.contact_description = null;
    } catch (error) {
        console.log(error);
    }
}

async function setInsured(id) {
    try {
        if (!id) return;
        const insured = await $api.get(`insured/${id}`);
        if (!props.isEdit && insured.policies) {


            setPolicy(id)

        }
        state.item.insured_id = insured.id;
        state.item.insured = insured.fullname;
        state.item.ident_no = insured.ident_no;
        state.item.birthdate = insured.birthdate;
        state.item.phone = insured.phone;
        state.item.email = insured.email;
        state.item.address = insured.address;
        state.item.birthdate = insured.birthdate;
        state.item.insured_language = insured.language;
        state.item.$sex_id = insured.$sex_id;
        state.item.insured_provider = insured.provider;
        state.item.high_profile = insured.high_profile;
    } catch (error) {
        console.log(error);
    }
}

function clearInsured() {
    state.item.insured_id = null;
    state.item.insured = null;
    state.item.ident_no = null;
    state.item.birthdate = null;
    state.item.insured_language = null;
    state.item.insured_code = null;
    state.item.insured_provider = []
    state.item.insurance_id = null;
    state.item.insurance_description = null;
    state.item.$sex_id = null;
    state.item.high_profile = null;
    clearPolicy()
}

function onReset() {
    setTimeout(() => {
        writeForm.value.resetValidation()
    }, 0);
}

async function removeEvent() {
    state.submitting = true;
    const response = await $api.delete(`event/${props.id}`);
    if (response) {
        $q.notify({
            type: 'success',
            message: 'Coordinación removida'
        })
        $emit('submit')
    }
    state.submitting = false;
}

async function getUsers() {
    const users = await $api.get('user', {
        params: {
            order: {
                description: "ASC"
            },
            group_by: 't_user.id',
            where: {
                c_status: 4,
                'bi:unixroles': 20
            },
            returnItems: true
        }
    })


    state.users = users.map(i => ({ ...i, label: i.description, value: i.id, label: i.description }))
}

async function getServices() {
    const services = await $api.get('catalogue', {
        params: {
            order: {
                description: "ASC"
            },
            group_by: 't_catalogue.id',
            where: {
                c_status: 4,
                $catalogue_category_id: 42
            },
            returnItems: true
        }
    })


    state.services = services.map(i => ({ ...i, label: i.description, value: i.id, label: i.description }))
}

async function onDelete(id) {
    try {
        const result = await $q.dialog({
            title: 'Confirmar',
            message: 'Deseas borrar este coordinación?',
            cancel: true,
            persistent: true
        })
        result.onOk(async () => {
            await $api.delete(`event/${id}`);
            $q.notify({
                type: 'success',
                message: 'Coordinación Removido'
            })
        })
    } catch (error) {
        console.log(error)
    }
}

async function onCancelEvent() {
    const response = await $api.put(`event/general/${state.item.id}`, {
        c_status: 2,
        $reason_cancellation_id: state.item.$reason_cancellation_id,
        cancelled_by: $me.description,
        cancelled_date: format(new Date(), 'yyyy-MM-dd hh:mm:ss')
    });
    $emit('close')

    if (response) {
        $q.notify({
            type: 'success',
            message: 'Coordinación Cancelada'
        })
    }
}

async function onOpenEvent(id) {
    const result = await $q.dialog({
        title: 'Confirmar',
        message: 'Deseas abrir esta Coordinación?',
        cancel: true,
        persistent: true
    })
    result.onOk(async () => {
        const response = await $api.put(`event/general/${id}`, {
            c_status: 4,
        });
        onInit()
        if (response) {
            $q.notify({
                type: 'success',
                message: 'Coordinación abierta'
            })
        }
    })
}

async function onSubmit() {

    state.submitting = true
    try {
        state.item.blocked = 0;
        state.item.blocked_by_id = null;
        if (pendingList.value) {
            state.item.pending_list = pendingList.value;
        }

        if (props.isEdit) {
            const response = await $api.put(`event/${props.id}`, state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Coordinación Editado'
                })
            }
        } else {
            const response = await $api.post('event', state.item);
            if (response) {
                $q.notify({
                    type: 'success',
                    message: 'Coordinación Agregado'
                })
                onReset()
                onInit()
            }
            if (!props.isDrawer) {
                $emit('changeTab', 'event')
            }
        }

        $emit('close')

    } catch (error) {
        console.log(error);
    }

    state.submitting = false;

}

async function getItineraries() {
    state.item.itinerary = await $api.get(`itinerary`, {
        params: {
            where: {
                c_status: 4,
                event_id: state.item.id,
            },
            returnItems: true
        }
    })
}

async function closeDialog() {
    await $api.put(`event/general/${props.id}`, {
        blocked: 0,
        blocked_by_id: null
    })
    $emit('close');
}

async function onInit() {
    try {

        getUsers()
        getServices()
        if (props.isEdit) {

            state.item = await $api.get(`event/${props.id}`);

            getItineraries()
            setInsured(state.item.insured_id)
            if (state.item.policy_id) {
                setPolicy(state.item.insured_id)
            } else {
                clearPolicy()
            }
            if (state.item.city_id) {
                const city = await $api.get(`utility/cities/${state.item.city_id}`)
                if (city) {
                    getTimeZone(city)
                }
            }
        } else {
            if (props.copyId) {

                state.item = await $api.get(`event/${props.copyId}`);

                if (!state.item.parent_id) {
                    state.item.parent_id = props.copyId
                    state.item.parent_code = state.item.code
                }
                setInsured(state.item.insured_id)
            } else {
                state.item = initialItem();
                // if (props.userId) {
                //     state.user = await $api.get(`user/${props.userId}`)
                //     state.item.user_description = state.user.description
                // }
                if (props.insuredId) {
                    state.item.insured_id = props.insuredId
                    setInsured(state.item.insured_id)
                }

                state.item.request_date = format(props.timestamp ? new Date(props.timestamp) : new Date(), 'dd-MM-yyyy')
                state.item.attendance_date = format(props.timestamp ? new Date(props.timestamp) : new Date(), 'dd-MM-yyyy')
            }
        }
        if (props.isEdit && !state.item.blocked) {
            await $api.put(`event/general/${props.id}`, {
                blocked: 1,
                blocked_by_id: $me.id
            })
        }
        state.loading = false
    } catch (error) {
        console.log(error);
    }
}

const style = computed(() => {
    return {
        width: props.width,
        'padding-right': props.isDrawer && '8px',
        'padding-left': props.isDrawer && '8px'
    }
})

function handleBeforeUnload() {
    if (document.visibilityState === "hidden") {
        const data = JSON.stringify({ id: state.item.id, blocked_by_id: $me.id });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`${process.env.API}utility/log-close`, blob);
    }
}

onMounted(async () => {
    await onInit()
    state.loading = false
    // nextTick(() => {
    //     mainInput.value.focus()
    // })

    if (props.isEdit) {
        window.addEventListener('visibilitychange', handleBeforeUnload);
    }

})

onBeforeMount(() => {
    clearInterval(state.interval_clock);
    window.removeEventListener('visibilitychange', handleBeforeUnload);
})

</script>