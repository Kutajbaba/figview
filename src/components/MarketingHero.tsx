interface Props {
  fileName?: string;
}

export function MarketingHero({ fileName }: Props) {
  return (
    <div className="w-full text-center">
      <h1 className="font-sfCompactDisplay inline-flex w-full items-center justify-center align-middle text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-[64px] sm:leading-[1.1]">
        Explore figma design with ease
      </h1>
      <p className="font-sfCompactText mx-auto mt-5 w-full max-w-none text-pretty text-base text-stone-600 sm:text-lg">
        Navigate and present figma designs with confidence
      </p>

      {fileName ? (
        <p className="mt-4 text-sm text-stone-500">
          Last loaded: <span className="font-medium text-stone-700">{fileName}</span>
        </p>
      ) : null}
    </div>
  );
}
