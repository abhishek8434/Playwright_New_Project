export const locators = {
  // Login page locators
  loginButton: 'button:has-text("Login")',
  continueButton: 'button:has-text("Continue")',

  //select type of marraiage and click on apply link 
  modalMrgPlaceSelection: '#modalMrgPlaceSelection li',
  placeOfMarriage: '#PlaceOfMarriage',
  proceedLink: 'link[role="link"][name="Proceed"]',
  requirementLink: 'link[role="link"][name="Requirement"]',
  applyForMarriage: '#ApplyforOrdinaryMarriage',
  okLink: 'link[role="link"][name="Ok"]',

  // Marriage form page locators
  husbandDetailsHeading: 'text=Husband Details',
  wifeDetailsHeading: 'text=Wife Details',
  proceedButton: 'a:has-text("Proceed")',
  submitButton: 'a:has-text("Submit")',
  affidavitField: '#li_husbanduploadaffidavit input[type="file"]',

  // Error messages and validation
  errorMessage: 'text=Please complete all the required field(s).',
  emailErrorMessage: 'text=Invalid Email Address',
  validationFileFormatError: 'text=Please upload file with png/jpeg/pdf/word format',
};

export const HusbandLocators = {
  title: '#HusbandTitle',
  dateOfBirth: '#husbandDateofbirth',

  datePickerYear: '#ui-datepicker-div >> role=combobox >> nth=1', // Updated for year selection
  datePickerDay: (day) => `a[role="link"]:has-text("${day}")`,
  placeOfBirth: '#HusbandPlaceOfBirth',
  status: '#HusbandStatus',
  affidavitUpload: '#li_husbanduploadaffidavit input[type="file"]',
  country: '#drpHusbandCountry',
  stateOfOrigin: '#drphusbandstateorgin',
  identityType: '#ddlPersonalIdentityTypeOfHusband',
  identityNumber: '#txtPersonalIdentityOfHusband',
  idUpload: '#li_HusbandUploadPersonalIdentification input[type="file"]',
  occupation: '#HusbandOccupation',
  fatherFirstName: '#HusbandFirstNameOfFather',
  fatherStatus: '#drpHusbandfatherstatus',
  fatherOccupation: '#HusbandFatherOccupation',
  passportUpload: '#HusbandPassport input[type="file"]',
  birthCertificateUpload: '#HusbandBirthCertificate input[type="file"]',
  indigeneDocumentUpload: '#li_husbandIndegeneDocument input[type="file"]',

};

export const WifeLocators = {
  title: '#WifeTitle',
  firstName: '#WifeFirstName',
  lastName: '#WifeLastName',
  dateOfBirth: '#wifeDateofbirth',
  datePickerYear: '#ui-datepicker-div >> nth=1',
  datePickerDay: (day) => `a[role="link"]:has-text("${day}")`,
  placeOfBirth: '#WifePlaceOfBirth',
  status: '#WifeStatus',
  affidavitUpload: '#li_wifeuploadaffidavit input[type="file"]',
  country: '#drpWifeCountry',
  stateOfOrigin: '#drpwifestateorgin',
  identityType: '#ddlPersonalIdentityTypeOfWife',
  identityNumber: '#txtPersonalIdentityOfWife',
  idUpload: '#li_WifeUploadPersonalIdentification input[type="file"]',
  address: '#WifeAddress',
  phone: '#WifePhone',
  email: '#WifeEmail', // Not used in your script but you may want to add it
  occupation: '#WifeOccupation',
  fatherFirstName: '#WifeFirstNameOfFather',
  fatherStatus: '#drpWifefatherstatus',
  fatherOccupation: '#WifeFatherOccupation',
  passportUpload: 'li:has-text("* Upload Your Passport Photograph") input[type="file"]',
  birthCertificateUpload: 'li:has-text("* Upload Birth Certificate") input[type="file"]',
  indigeneDocumentUpload: '#li_wifeIndegeneDocument input[type="file"]',
};

export const DocumentVerification = {
  certificateType: '#CertificateType',
  authorizationLetter: '#liAuthorizationLetter',
  marriageCertificateno: '#MarriageCertificateno',
  spinsterhoodCertificate: '#divSpinsterhoodCertificate',
  registryLocation: '#ddlRegistryLocation',
  bachelorhoodCertificate: '#divBachelorhoodCertificate',
  accrediationNo: "#AccrediationNo",
  requestReason: '#ReasonForCTC',
  husbandLastName: '#HusbandLastName',
  husbandFirstName: '#HusbandFirstName',
  drpHusbandCountry: '#drpHusbandCountry',
  drphusbandstateorgin: '#drphusbandstateorgin',
  husbandWifeOathRegistry: '#HusbandWifeOathRegistry',
  wifeLastName: '#WifeLastName',
  wifeFirstName: '#WifeFirstName',
  drpWifeCountry: '#drpWifeCountry',
  drpwifestateorgin: '#drpwifestateorgin'

};
export const certifiedtrucopy = {
  marriageCertificateno: '#MarriageCertificateno',
  husbandLastName: '#HusbandLastName',
  husbandFirstName: '#HusbandFirstName',
  drpHusbandCountry: '#drpHusbandCountry',
  drphusbandstateorgin: '#drphusbandstateorgin',
  husbandWifeOathRegistry: '#HusbandWifeOathRegistry',
  wifeLastName: '#WifeLastName',
  wifeFirstName: '#WifeFirstName',
  drpWifeCountry: '#drpWifeCountry',
  drpwifestateorgin: '#drpwifestateorgin',
  oathRegistry: '#HusbandWifeOathRegistry',
  applicationReason: '#ApplicationReason'

};
export const citizinshipform = {

  //personal information 
  piDateOfBirth: '#DateOfBirth',
  piBirthCountry: '#drpPlaceOfBirthCountry',
  piBirthState: '#drpPlaceOfBirthState',
  piCityOfBirth: '#CityOfBirth',
  piFirstArrivalToNigeria: '#DateFirstArrivalToNigeria',
  piPresentNationality: '#PresentNationality',
  piPresentNationalityAcquired: '#HowPresentNationalityAcquired',
  piPlaceOfAcquisition: '#PlaceOfAcquisition',
  piDateOfAcquisition: '#DateOfAcquisition',
  piPreviousAddress: '#AddressList_0__Address',
  piPreviousCountry: '#AddressList_0__Country',
  piPreviousState: '#ddlRespastState',
  piPreviousCity: '#AddressList_0__City',
  piPresentAddress: '#AddressList_1__Address',
  piPresentCountry: '#AddressList_1__Country',
  piPresentState: '#ddlRespresentState',
  piPresentCity: '#AddressList_1__City',

  //Professional Information 
  profOccupation: '#Occupation',
  profNameOfOrganization: '#NameOfOrganization',
  profOrganizationType: '#OrganizationType',
  profPositionHeld: '#PositionHeld',
  profMonthlySalary: '#txtMonthlySalary',

  //citizenship information 
  ciCitizenshipNationality: '[id="CitizenshipNationalityList\\[0\\]\\.CountryId"]',
  ciHowAcquired: '[id="CitizenshipNationalityList\\[0\\]\\.HowAcquired"]',
  ciPlaceOfAcquisition: '[id="CitizenshipNationalityList\\[0\\]\\.PlaceOfAcquisition"]',
  ciDateOfAcquisition: '[id="CitizenshipNationalityList\\[0\\]\\.PlaceOfAcquisition"]',
  ciForeignLanguage: '[id="ForeignLanguageList\\[0\\]\\.Name"]',
  ciLanguageForeignProficiency: '#divLanguageForeignPart-1',
  ciForeignLanguage1: '[id="ForeignLanguageList\\[1\\]\\.Name"]',
  ciForeignLanguage2: '[id="ForeignLanguageList\\[2\\]\\.Name"]',
  ciLanguageForeignProficiency1: '#divLanguageForeignPart-2',
  ciRemoveLanguage: '[id="btnRemove\\ remove_LanguageForeign-2"]',
  ciIndegenousLanguage: '[id="IndegenouSpokenList\\[0\\]\\.Name"]',
  ciIndegenousProficiency: '#divLanguageIndigenousPart-1',
  ciVisitedCountry: '[id="VisitedCountryList\\[0\\]\\.VisitedCountry"]',
  ciFromDate: '#Edit_FromDate_0',
  ciToDate: '#Edit_ToDate_0',
  ciPurposeOfVisit: '#VisitedCountryList_0__PurposeOfVisit',
  ciCountryToRenounce: '#ddlCountryToRenounce',

  //Asset Owned
  aoPropertiesWithinNigeria: '#LandedPropertiesWithinNigeria',
  aoOtherAssets: '#OtherAssets',
  aoPropertiesOutSideNigeria: '#LandedPropertiesOutSideNigeria',
  aoAssetssOutSideNigeria: '#OtherAssetssOutSideNigeria',
  aoSupportingDocument: '#DocumentList_0__Document',

  //Details Of Dependants
  ddLastName: '#DependantsDetails_LastName',
  ddFirstName: '#DependantsDetails_FirstName',
  ddDOB: '#dtDependantsDOB',
  ddCountryOfBirth: '#DependantsDetails_CountryOfBirth',
  ddRelationshipWithDependant: '#DependantsDetails_RelationshipWithDependant',
  ddAnnualSupportDependent: '#txtannualsupportdependent',
  ddResidentialAddressInNigeria: '#DependantsDetails_ResidentialAddressInNigeria',
  ddCountry: '#DDLDependantcountry_0',
  ddResidentialCityInNigeria: '#DependantsDetails_ResidentialCityInNigeria',
  ddResidentialAddressOutsideNigeria: '#DependantsDetails_ResidentialAddressOutsideNigeria',
  ddResidentialCountryIsOutsideNigeria: '#DependantsDetails_ResidentialCountryIdOutsideNigeria',
  ddResidentialStateOutsideNigeria: '#ddlResidentialStateIdOutsideNigeria',
  ddResidentialCityOutNigeria: '#DependantsDetails_ResidentialCityInNigeria',
  ddPermanentResidentialAddress: '#DependantsDetails_PermanentResidentialAddress',
  ddPermanentResidentialCountryId: '#DependantsDetails_PermanentResidentialCountryId',
  ddPermanentResidentialStateId: '#ddlPermanentResidentialStateId',
  ddPermanentResidentialCity: '#DependantsDetails_PermanentResidentialCity',
 

  //Guarantor's Details
  gdLastName: '#GuarantorDetailList_0__LastName',
  gdFirstName: '#GuarantorDetailList_0__FirstName',
  gdPlaceOfBirth: '#GuarantorDetailList_0__PlaceOfBirth',
  gdNationality: '#GuarantorDetailList_0__Nationality',
  gdProfession: '#GuarantorDetailList_0__Profession',
  gdRankInProfession: '#GuarantorDetailList_0__RankInProfession',
  gdDateOfBirth: '#GuarantorDetailList_0__DateOfBirth',
  gdHaveKnownOfGuarantor: '#GuarantorDetailList_0__CircumstancesHaveKnownOfGuarantor',
  gdAddress: '#GuarantorDetailList_0__Address',
  gdCountry: '#GuarantorDetailList_0__Country',
  gdState: '#ddlGuarantorState0',
  gdCity: '#GuarantorDetailList_0__City',
  gdLastName1: '#GuarantorDetailList_1__LastName',
  gdFirstName1: '#GuarantorDetailList_1__FirstName',
  gdPlaceOfBirth1: '#GuarantorDetailList_1__PlaceOfBirth',
  gdNationality1: '#GuarantorDetailList_1__Nationality',
  gdProfession1: '#GuarantorDetailList_1__Profession',
  gdRankInProfession1: '#GuarantorDetailList_1__RankInProfession',
  gdDateOfBirth1: '#GuarantorDetailList_1__DateOfBirth',
  gdHaveKnownOfGuarantor1: '#GuarantorDetailList_1__CircumstancesHaveKnownOfGuarantor',
  gdAddress1: '#GuarantorDetailList_1__Address',
  gdCountry1: '#GuarantorDetailList_1__Country',
  gdState1: '#ddlGuarantorState1',
  gdCity1: '#GuarantorDetailList_1__City',

  //Reason For Application
  ReasonOfApplication: '#ReasonOfApplication',

  //Declaration

  //Documents Upload
  duPassportPhotograph: '#PassportPhotograph',
  duBirthCertificate: '#BirthCertificate',
  du5PagesOfInternationalPassport: '#First5PagesOfInternationalPassport',
  duEvidenceOLivelihood: '#EvidenceOfMeansOfLivelihood',
  duTaxclearanceCertificate: '#TaxclearanceCertificate',
  duResidencePermit: '#ResidencePermit',
  duEvidenceOfSocioEconomicContributions: '#EvidenceOfSocioEconomicContributions',
  duGuarantorDownloadedFrom: '#GuarantorDetailList_0__GuarantorDownloadedFrom',
  duGuarantorPassportPhotograph: '#GuarantorDetailList_0__PassportPhotograph',
  duGuarantorCurriculumVitae: '#GuarantorDetailList_0__CurriculumVitae',
  duGuarantorIdCard: '#GuarantorDetailList_0__IdCard',
  duGuarantorDownloadedFrom1: '#GuarantorDetailList_1__GuarantorDownloadedFrom',
  duGuarantorPassportPhotograph1: '#GuarantorDetailList_1__PassportPhotograph',
  duGuarantorCurriculumVitae1: '#GuarantorDetailList_1__CurriculumVitae',
  duGuarantorIdCard1: '#GuarantorDetailList_1__IdCard',
  duNecessaryDocumentName: '#necessaryDocumentList_0__DocumentName',
  duNecessaryDocument: '#necessaryDocumentList_0__Document'

}


















