/** A minimal low-top sneaker in profile (toe to the right): the stand-in for a pair without a photo yet. */
export function SneakerSilhouette({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 24" fill="currentColor" className={className}>
      <path d="M4.2 6.8c.2-1 1-1.5 2-1.4l5 .6c1.9.3 2.9 2 4.9 2.2l2.9.2 2-4.2c.4-.8 1.4-1.1 2.2-.6l1.8 1.4 11 6.5c4 1 7.9 1.7 8.9 4 .5 1.3.2 2.3-.4 2.9H3.6c-.3-3.6 0-8.2.6-11.6Z" />
      <path d="M3 19.4h42v.9c0 .9-.7 1.6-1.6 1.6H4.5c-.8 0-1.5-.7-1.5-1.5Z" opacity=".75" />
    </svg>
  );
}
