
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefenseLayer } from './models/defense-layer.model';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  readonly layers = signal<DefenseLayer[]>([
    { id: 'data', name: 'Data', description: "Controls access to business and customer data. Often, regulatory requirements dictate the controls to ensure data confidentiality, integrity, and availability.", details: ["Stored in a database.", "Stored on disk inside virtual machines.", "Stored in SaaS applications.", "Managed through cloud storage."], color: '#ffffff', radius: 50 },
    { id: 'application', name: 'Application', description: "Helps ensure that applications are secure and free of security vulnerabilities.", details: ["Ensure applications are secure and free of vulnerabilities.", "Store sensitive application secrets in a secure storage medium.", "Make security a design requirement for all application development."], color: '#bae6fd', radius: 90 },
    { id: 'compute', name: 'Compute', description: "Secures access to virtual machines and helps minimize security issues from malware or unpatched systems.", details: ["Secure access to virtual machines.", "Implement endpoint protection on devices.", "Keep systems patched and current."], color: '#7dd3fc', radius: 130 },
    { id: 'network', name: 'Network', description: "Limits communication between resources through segmentation and access controls to reduce risk of attack spread.", details: ["Limit communication between resources.", "Deny by default.", "Restrict inbound internet access and limit outbound access.", "Implement secure connectivity to on-premises networks."], color: '#38bdf8', radius: 170 },
    { id: 'perimeter', name: 'Perimeter', description: "Uses DDoS protection and firewalls to filter large-scale attacks before they can cause a denial of service for users.", details: ["Use DDoS protection to filter large-scale attacks.", "Use perimeter firewalls to identify and alert on malicious attacks."], color: '#0ea5e9', radius: 210 },
    { id: 'identity', name: 'Identity & Access', description: "Controls access to infrastructure and change control, ensuring identities are secure and access is logged.", details: ["Control access to infrastructure and change control.", "Use single sign-on (SSO) and multifactor authentication.", "Audit events and changes."], color: '#0284c7', radius: 250 },
    { id: 'physical', name: 'Physical Security', description: "The first line of defense to protect computing hardware in the datacenter.", details: ["Physically secure access to buildings.", "Control access to computing hardware within the datacenter."], color: '#0369a1', radius: 290 },
  ]);
  
  readonly selectedLayer = signal<DefenseLayer | null>(null);
  readonly generatedChecklist = signal<string[] | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  selectLayer(layer: DefenseLayer | null): void {
    if (this.selectedLayer()?.id !== layer?.id) {
        this.selectedLayer.set(layer);
        this.generatedChecklist.set(null);
        this.error.set(null);
    }
  }

  async handleGenerateChecklist(): Promise<void> {
    const currentLayer = this.selectedLayer();
    if (!currentLayer) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedChecklist.set(null);

    try {
      const checklist = await this.geminiService.generateChecklist(currentLayer.name, currentLayer.description);
      this.generatedChecklist.set(checklist);
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.error.set(e.message);
      } else {
        this.error.set('An unknown error occurred.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  getLayerById(id: string): DefenseLayer | undefined {
    return this.layers().find(l => l.id === id);
  }
}
