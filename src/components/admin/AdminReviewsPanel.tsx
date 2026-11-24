import { Eye, EyeOff, Flag, Star } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAdminReviewMutations, useReportedReviews } from "@/hooks/useAdmin";
import type { AdminReview } from "@/types/admin";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatTimeAgo } from "@/utils/format";

const CRITERIA: { key: keyof AdminReview; label: string }[] = [
  { key: "technical_quality", label: "Qualidade técnica" },
  { key: "scope_clarity", label: "Clareza do escopo" },
  { key: "communication", label: "Comunicação" },
  { key: "commitment", label: "Comprometimento" },
  { key: "professionalism", label: "Profissionalismo" },
];

function ReviewCard({ review }: { review: AdminReview }) {
  const { setCommentHidden } = useAdminReviewMutations();
  const [error, setError] = useState<string | null>(null);
  const direction = review.direction === "company_to_dev" ? "Empresa avaliou dev" : "Dev avaliou empresa";

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{direction}</Badge>
            <Badge tone="red" icon={<Flag className="size-3.5" aria-hidden />}>
              {review.report_count} denúncia(s)
            </Badge>
            {review.comment_hidden && <Badge tone="yellow">Comentário oculto</Badge>}
            {!review.revealed && <Badge>Ainda não revelada</Badge>}
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Autor: <span className="text-white">{review.reviewer?.full_name ?? "Conta removida"}</span>
            <span className="text-slate-500"> · {formatDate(review.created_at)}</span>
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-lg font-semibold text-flag-yellow">
          <Star className="size-4 fill-current" aria-hidden /> {Number(review.rating).toFixed(1)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CRITERIA.map(({ key, label }) => (review[key] === null || review[key] === undefined ? null : <Badge key={key}>{`${label}: ${String(review[key])}/5`}</Badge>))}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
        {review.comment ? <p className="whitespace-pre-line text-sm text-slate-200">{review.comment}</p> : <p className="text-sm text-slate-500">Sem comentário (só nota).</p>}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Motivos das denúncias</p>
        <ul className="mt-2 space-y-1.5">
          {review.reports.map((report, index) => (
            <li key={index} className="text-sm text-slate-300">
              “{report.reason}” <span className="text-xs text-slate-500">· {formatTimeAgo(report.created_at)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant={review.comment_hidden ? "purple" : "danger"}
          size="sm"
          disabled={!review.comment}
          loading={setCommentHidden.isPending}
          onClick={() => {
            setError(null);
            setCommentHidden.mutate({ id: review.review_id, hidden: !review.comment_hidden }, { onError: (err) => setError(getErrorMessage(err)) });
          }}
        >
          {review.comment_hidden ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
          {review.comment_hidden ? "Reexibir comentário" : "Ocultar comentário"}
        </Button>
        <span className="text-xs text-slate-500">A nota continua valendo na média; só o texto some da vista pública.</span>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </Panel>
  );
}

export function AdminReviewsPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useReportedReviews(page);

  return (
    <div>
      {isLoading && <Spinner />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && <EmptyState title="Nenhuma avaliação denunciada">Quando alguém denunciar uma avaliação, ela aparece aqui.</EmptyState>}
      {data && data.items.length > 0 && (
        <>
          <p className="mb-3 text-xs text-slate-500">{data.total} avaliação(ões) denunciada(s), mais denunciadas primeiro</p>
          <div className={`grid gap-4 ${isFetching ? "opacity-60" : ""}`}>
            {data.items.map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}