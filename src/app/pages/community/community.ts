import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal';
import { CommunityService, CommunityRoadmap } from '../../services/community';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './community.html',
})
export class CommunityComponent implements OnInit {
  private communityService = inject(CommunityService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  categories = ['All', 'Frontend', 'Backend', 'AI/ML', 'Data', 'DevOps'];
  activeCategory = 'All';
  searchQuery = '';
  activePost: CommunityRoadmap | null = null;
  likedIds = new Set<string>();
  posts: CommunityRoadmap[] = [];
  isLoading = true;

  get filteredPosts(): CommunityRoadmap[] {
    return this.posts.filter((p) => {
      const q = this.searchQuery.toLowerCase();
      return !q || p.title.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q);
    });
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.communityService.getPublic().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openPost(post: CommunityRoadmap) {
    this.activePost = post;
  }
  closePost() {
    this.activePost = null;
  }

  toggleLike(id: string, e?: MouseEvent) {
    e?.stopPropagation();
    this.communityService.toggleLike(id).subscribe({
      next: (res) => {
        if (res.liked) {
          this.likedIds.add(id);
          this.toast.show('좋아요를 눌렀습니다', 'success');
        } else {
          this.likedIds.delete(id);
          this.toast.show('좋아요를 취소했습니다', 'info');
        }
        this.likedIds = new Set(this.likedIds);
        this.cdr.detectChanges();
      },
      error: () => this.toast.show('로그인이 필요합니다', 'error'),
    });
  }

  isLiked(id: string): boolean {
    return this.likedIds.has(id);
  }

  likeCount(post: CommunityRoadmap): number {
    return (post._count?.likes ?? 0) + (this.isLiked(post.id) ? 1 : 0);
  }

  monogramColor(name: string): string {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-amber-100 text-amber-800',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
      'bg-violet-100 text-violet-700',
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return colors[h % colors.length];
  }
}
