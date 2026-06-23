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
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.posts;
    return this.posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q),
    );
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.communityService.getPublic(this.activeCategory).subscribe({
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

  selectCategory(cat: string) {
    this.activeCategory = cat;
    this.loadPosts();
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

  isLiked(id: string) {
    return this.likedIds.has(id);
  }

  likeCount(post: CommunityRoadmap) {
    return (post._count?.likes ?? 0) + (this.isLiked(post.id) ? 1 : 0);
  }
}
