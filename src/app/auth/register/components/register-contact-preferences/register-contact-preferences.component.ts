import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

interface Country {
  name: string;
  code: string;
  iso: string;
}

@Component({
  selector: 'app-register-contact-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-contact-preferences.component.html',
  styleUrl: './register-contact-preferences.component.less'
})
export class RegisterContactPreferencesComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  isDropdownOpen = false;
  searchTerm = '';
  selectedCountry: Country | null = null;

  readonly countries: Country[] = [
    { name: 'United States', code: '+1', iso: 'us' },
    { name: 'United Kingdom', code: '+44', iso: 'gb' },
    { name: 'Canada', code: '+1', iso: 'ca' },
    { name: 'Australia', code: '+61', iso: 'au' },
    { name: 'Germany', code: '+49', iso: 'de' },
    { name: 'France', code: '+33', iso: 'fr' },
    { name: 'Italy', code: '+39', iso: 'it' },
    { name: 'Spain', code: '+34', iso: 'es' },
    { name: 'Netherlands', code: '+31', iso: 'nl' },
    { name: 'Belgium', code: '+32', iso: 'be' },
    { name: 'Switzerland', code: '+41', iso: 'ch' },
    { name: 'Austria', code: '+43', iso: 'at' },
    { name: 'Sweden', code: '+46', iso: 'se' },
    { name: 'Norway', code: '+47', iso: 'no' },
    { name: 'Denmark', code: '+45', iso: 'dk' },
    { name: 'Finland', code: '+358', iso: 'fi' },
    { name: 'Poland', code: '+48', iso: 'pl' },
    { name: 'Portugal', code: '+351', iso: 'pt' },
    { name: 'Ireland', code: '+353', iso: 'ie' },
    { name: 'Greece', code: '+30', iso: 'gr' },
    { name: 'Croatia', code: '+385', iso: 'hr' },
    { name: 'Czech Republic', code: '+420', iso: 'cz' },
    { name: 'Romania', code: '+40', iso: 'ro' },
    { name: 'Hungary', code: '+36', iso: 'hu' },
    { name: 'Brazil', code: '+55', iso: 'br' },
    { name: 'Mexico', code: '+52', iso: 'mx' },
    { name: 'Argentina', code: '+54', iso: 'ar' },
    { name: 'Colombia', code: '+57', iso: 'co' },
    { name: 'Chile', code: '+56', iso: 'cl' },
    { name: 'Peru', code: '+51', iso: 'pe' },
    { name: 'Japan', code: '+81', iso: 'jp' },
    { name: 'South Korea', code: '+82', iso: 'kr' },
    { name: 'China', code: '+86', iso: 'cn' },
    { name: 'India', code: '+91', iso: 'in' },
    { name: 'Singapore', code: '+65', iso: 'sg' },
    { name: 'Hong Kong', code: '+852', iso: 'hk' },
    { name: 'Taiwan', code: '+886', iso: 'tw' },
    { name: 'Thailand', code: '+66', iso: 'th' },
    { name: 'Malaysia', code: '+60', iso: 'my' },
    { name: 'Philippines', code: '+63', iso: 'ph' },
    { name: 'Indonesia', code: '+62', iso: 'id' },
    { name: 'Vietnam', code: '+84', iso: 'vn' },
    { name: 'United Arab Emirates', code: '+971', iso: 'ae' },
    { name: 'Saudi Arabia', code: '+966', iso: 'sa' },
    { name: 'Israel', code: '+972', iso: 'il' },
    { name: 'Turkey', code: '+90', iso: 'tr' },
    { name: 'South Africa', code: '+27', iso: 'za' },
    { name: 'Egypt', code: '+20', iso: 'eg' },
    { name: 'Nigeria', code: '+234', iso: 'ng' },
    { name: 'Kenya', code: '+254', iso: 'ke' },
    { name: 'New Zealand', code: '+64', iso: 'nz' },
    { name: 'Russia', code: '+7', iso: 'ru' },
    { name: 'Ukraine', code: '+380', iso: 'ua' }
  ];

  get filteredCountries(): Country[] {
    if (!this.searchTerm) {
      return this.countries;
    }
    const term = this.searchTerm.toLowerCase();
    return this.countries.filter(
      country =>
        country.name.toLowerCase().includes(term) ||
        country.code.includes(term)
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  onInputFocus(): void {
    this.isDropdownOpen = true;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    // Check if autofill entered a country name - auto-select it
    const matchedCountry = this.countries.find(
      c => c.name.toLowerCase() === value.toLowerCase()
    );
    
    if (matchedCountry) {
      this.selectCountry(matchedCountry);
      return;
    }
    
    this.searchTerm = value;
    this.selectedCountry = null;
    this.isDropdownOpen = true;
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.searchTerm = '';
    this.form.controls.phoneCountryCode.setValue(country.code);
    this.isDropdownOpen = false;
  }

  getFlagUrl(iso: string): string {
    return `https://flagcdn.com/24x18/${iso}.png`;
  }

  get displayValue(): string {
    if (this.selectedCountry) {
      return this.selectedCountry.code;
    }
    return this.searchTerm;
  }

  onPhoneNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove leading zero if present (common with autofill)
    if (value.startsWith('0')) {
      value = value.substring(1);
      input.value = value;
      this.form.controls.phoneNumber.setValue(value);
    }
  }
}
