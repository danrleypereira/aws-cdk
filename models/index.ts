export interface ContactInfo {
  email: string;
  phone: string;
  isPrimary: boolean; // Indica se o contato é o principal
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  active: boolean;
  birthdate: string;
  addressList: string[];
  contactInfoList: ContactInfo[];
}
