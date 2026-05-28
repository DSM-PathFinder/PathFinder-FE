import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './modal.html',
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() maxWidth = 'max-w-lg';
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this.close.emit();
  }
}
