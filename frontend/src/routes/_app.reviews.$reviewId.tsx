import { createFileRoute } from '@tanstack/react-router'; // Wait, let me use @tanstack/react-router
import { createFileRoute as routerCreateFileRoute } from '@tanstack/react-router';
import { ReviewDetailView } from '../features/reviews/components/ReviewDetailView';

export const Route = routerCreateFileRoute('/_app/reviews/$reviewId')({
  component: ReviewDetailPage,
});

function ReviewDetailPage() {
  const { reviewId } = Route.useParams();
  
  return (
    <div className="flex-1 w-full h-[calc(100vh-64px)] relative">
      <ReviewDetailView reviewId={reviewId} />
    </div>
  );
}
