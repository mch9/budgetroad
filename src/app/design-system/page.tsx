'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const colorTokens = [
  { name: 'primary', className: 'bg-primary', text: 'text-primary-foreground' },
  {
    name: 'secondary',
    className: 'bg-secondary',
    text: 'text-secondary-foreground',
  },
  { name: 'accent', className: 'bg-accent', text: 'text-accent-foreground' },
  { name: 'muted', className: 'bg-muted', text: 'text-muted-foreground' },
  { name: 'card', className: 'bg-card ring-1 ring-border', text: 'text-card-foreground' },
  { name: 'border', className: 'bg-border', text: 'text-foreground' },
  {
    name: 'destructive',
    className: 'bg-destructive',
    text: 'text-destructive-foreground',
  },
  {
    name: 'foreground',
    className: 'bg-foreground',
    text: 'text-background',
  },
];

const typographyScale = [
  { name: 'display', className: 'text-display tracking-display leading-display font-bold' },
  { name: 'h1', className: 'text-h1 tracking-tight font-bold' },
  { name: 'h2', className: 'text-h2 font-semibold' },
  { name: 'h3', className: 'text-h3 font-semibold' },
  { name: 'body', className: 'text-body' },
  { name: 'caption', className: 'text-caption text-muted-foreground' },
];

const buttonVariants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
const buttonSizes = ['xs', 'sm', 'default', 'lg'] as const;
const badgeVariants = ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-h2 font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-caption text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="rounded-xl bg-card p-6 ring-1 ring-border">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <header className="mb-10">
          <h1 className="text-display tracking-display leading-display font-bold">
            Budgetroad Design System
          </h1>
          <p className="mt-3 text-body text-muted-foreground">
            Claude Design(base-nova) 기반. 토큰과 컴포넌트의 실제 렌더를 한 페이지에서 확인합니다.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          <Section title="Colors" description="globals.css의 semantic 토큰. 모든 페이지는 이 이름으로 참조.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colorTokens.map((token) => (
                <div
                  key={token.name}
                  className={`flex h-20 flex-col justify-end rounded-lg p-3 ${token.className} ${token.text}`}
                >
                  <span className="text-xs font-mono">{token.name}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Typography" description="--text-* 토큰은 Tailwind 유틸리티로 자동 노출.">
            <div className="flex flex-col gap-4">
              {typographyScale.map((t) => (
                <div key={t.name} className="flex items-baseline gap-6 border-b border-border pb-3 last:border-b-0">
                  <span className="w-20 shrink-0 text-caption text-muted-foreground font-mono">
                    {t.name}
                  </span>
                  <span className={t.className}>버짓로드</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Buttons" description="variant × size 조합.">
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-3 text-caption text-muted-foreground">variants</p>
                <div className="flex flex-wrap gap-2">
                  {buttonVariants.map((v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-3 text-caption text-muted-foreground">sizes</p>
                <div className="flex flex-wrap items-center gap-2">
                  {buttonSizes.map((s) => (
                    <Button key={s} size={s}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Cards">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>기본 카드</CardTitle>
                  <CardDescription>default size, header + content + footer</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    카드 내부 콘텐츠. ring-1 ring-foreground/10으로 경계 표현.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">확인</Button>
                </CardFooter>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Compact (size=&quot;sm&quot;)</CardTitle>
                  <CardDescription>좁은 공간에 들어가는 카드.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">gap/padding이 자동으로 줄어듭니다.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section title="Forms" description="Input + Label + RadioGroup 조합.">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>선호 지역</Label>
                <RadioGroup defaultValue="seoul">
                  {[
                    { value: 'seoul', label: '서울' },
                    { value: 'gyeonggi', label: '경기' },
                    { value: 'local', label: '지방' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <RadioGroupItem value={opt.value} />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              {badgeVariants.map((v) => (
                <Badge key={v} variant={v}>
                  {v}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="Tabs">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="tokens">토큰</TabsTrigger>
                <TabsTrigger value="components">컴포넌트</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-4 text-muted-foreground">
                Claude Design 기반 디자인 시스템의 진입점.
              </TabsContent>
              <TabsContent value="tokens" className="pt-4 text-muted-foreground">
                globals.css의 @theme 블록에서 컬러/타이포/모션 토큰을 관리합니다.
              </TabsContent>
              <TabsContent value="components" className="pt-4 text-muted-foreground">
                shadcn base-nova 레지스트리에서 필요에 따라 추가 설치.
              </TabsContent>
            </Tabs>
          </Section>

          <Section title="Dialog">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Dialog 열기
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>예산 결과 저장</DialogTitle>
                  <DialogDescription>
                    이 예산 초안을 공유 가능한 링크로 저장할까요?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <Button>저장</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          <Section title="Skeleton">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Section>

          <Section title="Motion" description="--duration-* + --ease-out-expo 조합으로 Claude 느낌의 전환.">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-fast ease-out-expo hover:scale-105"
              >
                duration-fast · ease-out-expo
              </button>
              <button
                type="button"
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all duration-base ease-out-expo hover:translate-y-[-2px]"
              >
                duration-base · ease-out-expo
              </button>
            </div>
          </Section>
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-caption text-muted-foreground">
          토큰 수정: <code className="font-mono">src/app/globals.css</code> · 새 컴포넌트 추가:{' '}
          <code className="font-mono">bunx shadcn@latest add {'{name}'}</code>
        </footer>
      </div>
    </main>
  );
}
