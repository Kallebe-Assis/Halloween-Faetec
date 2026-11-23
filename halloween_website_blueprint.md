# Roteiro Completo: Website de Halloween Interativo e de Alta Performance

Este documento serve como o mapa de arquitetura e desenvolvimento para a criação de uma *Single-Page Application* (SPA) temática de Halloween. O objetivo principal é unir **riqueza de conteúdo**, **interatividade avançada** e **animações fluidas**, mantendo a estrutura extremamente leve (usando apenas HTML5, CSS3 puro e Vanilla JavaScript, sem dependência de frameworks pesados).

---

## 1. Visão Geral e Filosofia do Projeto

* **O Que:** Uma página web temática e imersiva sobre o Halloween cobrindo história, lendas, tradições, simulações e elementos visuais interativos.
* **Por Que:** Proporcionar uma experiência altamente visual e interativa sem comprometer o tempo de carregamento ou o desempenho em dispositivos móveis.
* **Como:** Utilizando **HTML5 Semântico**, **CSS Variables + Keyframes** (para aceleração por hardware com `transform` e `opacity`), e **Vanilla JS com IntersectionObserver** para gatilhos de scroll.
* **Quando:** Organizado em etapas progressivas de desenvolvimento (Layout → Estilização → Animações → Interatividade → Otimização).

---

## 2. Paleta de Cores e Identidade Visual

| Elemento | Cor / Valor CSS | Propósito |
| :--- | :--- | :--- |
| **Fundo Principal** | `#0b090a` (Vampire Black) | Imersão noturna profunda |
| **Destaque Primário** | `#ff6b00` (Pumpkin Orange) | Botões, títulos e elementos ativos |
| **Destaque Secundário** | `#800080` (Witch Purple) | Sombras, bordas e detalhes místicos |
| **Verde Neon** | `#39ff14` (Toxic Green) | Efeitos de hover, feitiços e alertas |
| **Texto Base** | `#f8f9fa` (Ghost White) | Leitura confortável em fundos escuros |

---

## 3. Estrutura de Conteúdo e Arquitetura do Layout (O Que e Onde)

### 3.1. Cabeçalho & Hero Section (Abertura Imersiva)
* **O Que:** Acolhimento visual impactante com fundo animado de névoa e morcegos flutuantes.
* **Onde:** No topo da página (`<header>` e `<section id="hero">`).
* **Elementos:**
  * Logo em neon oscilante com abóbora interativa.
  * Título principal com efeito de texto "sangrento" ou brilhante.
  * Botão de ação (CTA) com efeito de pulso CSS: "Explorar o Ritual".
  * Seletor de Trilha Sonora (Web Audio API / Toggle de som ambiente de vento/corujas).

### 3.2. Linha do Tempo Histórica (Timeline Interativa)
* **O Que:** A evolução cronológica do Halloween.
* **Onde:** Segunda seção (`<section id="timeline">`).
* **Conteúdo:**
  1. **400 a.C. - Festival Samhain (Celtas):** Fim da colheita e abertura dos portões entre vivos e mortos.
  2. **Século VIII - Dia de Todos os Santos:** A influência da Igreja Católica e a transição para "All Hallows' Eve".
  3. **Século XIX - Imigração Irlandesa nos EUA:** A popularização da abóbora (Jack-o'-Lantern) no lugar do nabo.
  4. **Século XX - Doces ou Travessuras:** A comercialização e expansão da tradição da coleta de doces.
  5. **Século XXI - Cultura Pop Global:** Filmes de terror, cosplay e festas mundiais.
* **Como Funciona:** Linha vertical conectada com nós interativos que expandem detalhes ao serem clicados ou scrollados.

### 3.3. Central de Conhecimento em Abas (Tabs UI)
* **O Que:** Módulo organizado para leitura dinâmica sobre diferentes vertentes do Halloween.
* **Onde:** Terceira seção (`<section id="lore-tabs">`).
* **Abas Propostas:**
  * **Aba 1: Lendas Urbana & Mitos:** O Homem Sem Cabeça, Bloody Mary, A Chorona.
  * **Aba 2: Criaturas da Noite:** Vampiros, Lobisomens, Bruxas, Fantasmas.
  * **Aba 3: Símbolos e Significados:** A Abóbora Jack, Gatos Pretos, Vassouras, Caldeirões.
  * **Aba 4: Tradições Mundiais:** *Día de los Muertos* (México), *Pangangaluluwa* (Filipinas), *Awuru Odo* (Nigéria).

### 3.4. Carrossel de Fantasias e Decorações Populares
* **O Que:** Carrossel leve deslizante sem dependências externas (como Swiper ou Slick).
* **Onde:** Quarta seção (`<section id="carousel">`).
* **Recursos:**
  * Suporte a navegação por botões (Anterior / Próximo) e pontos (dots).
  * Suporte a gestos de touch/swipe em dispositivos móveis via JS minimalista.
  * Cards 3D com efeito de *tilt* no hover.

### 3.5. Galeria Interativa & Filtros de Imagens
* **O Que:** Grid responsivo com cartões dinâmicos e lightbox nativo.
* **Onde:** Quinta seção (`<section id="gallery">`).
* **Categorias de Filtro:**
  * Todos
  * Cinema de Terror
  * Decorações Assustadoras
  * Arte Fantástica
* **Interação:** Filtro instantâneo com CSS Grid e `opacity/scale` transitions; clique para expandir o modal da imagem.

### 3.6. Caldeirão das Bruxas (Gerador Interativo)
* **O Que:** Um minijogo/mini-widget leve onde o usuário escolhe 3 ingredientes para "gerar uma poção mágica".
* **Onde:** Sexta seção (`<section id="potion-maker">`).
* **Por Que:** Aumenta drasticamente o tempo de permanência na página e o engajamento através da ludicidade.

---

## 4. Efeitos, Animações e Transições (Como e Quando)

### 4.1. Animações de Scroll (Intersection Observer)
* **Quando:** Disparadas quando o usuário rola a página e o elemento entra no *viewport*.
* **Efeitos:**
  * `fade-up`: Elementos sobem suavemente com opacidade progressiva.
  * `ghost-float`: Efeito de levitação para imagens e cards (`translateY`).
  * `glitch-text`: Pequena distorção rápida em títulos principais ao entrarem na tela.

### 4.2. Sistema de Partículas Leve (Canvas 2D ou CSS Pure Nodes)
* **O Que:** Partículas de folhas secas, brasas ou névoa flutuando no fundo.
* **Como:**
  * Renderização otimizada em `<canvas>` usando `requestAnimationFrame`.
  * Quantidade controlada de objetos (máximo 40 partículas) para não sobrecarregar a CPU.

### 4.3. Efeitos de Hover Micro-interativos
* **Botões:** Brilho neon (`box-shadow`), tremor leve (`transform: rotate()`) e alteração de cursor para uma vassoura ou abóbora personalizada.
* **Cards:** Inclinamento 3D sutil via `perspective` e `rotateX/rotateY`.

---

## 5. Roteiro Passo a Passo de Construção (Hands-on Plan)

```
[Etapa 1: HTML Baseline]
 ├── Estruturação Semântica (<header>, <main>, <section>, <footer>)
 ├── Inclusão de metatags SEO e responsividade
 └── Definição das áreas de conteúdo e IDs para ancoragem

[Etapa 2: CSS Core & Design System]
 ├── Definição de Variáveis CSS (:root com cores, fontes e transições)
 ├── Normalização de estilos globais (Reset)
 ├── Configuração de CSS Grid e Flexbox para layouts responsivos
 └── Estilização estética das seções (Hero, Timeline, Tabs, Gallery, Carousel)

[Etapa 3: Animações CSS & Keyframes]
 ├── Animações de levitação (@keyframes float)
 ├── Animação de brilho neon (@keyframes pulse-glow)
 ├── Transições de abas e modal (@keyframes fadeIn)
 └── Efeito de névoa ou fumaça de fundo

[Etapa 4: Logica Vanilla JavaScript]
 ├── Lógica das Abas (Tabs switcher via data-attributes)
 ├── Lógica do Carrossel (Touch + Click slide offset)
 ├── Intersection Observer para acionar animações no scroll
 ├── Filtro da Galeria (Hide/Show com transição de opacidade)
 └── Lógica do Gerador de Poção / Sistema de Partículas no Canvas

[Etapa 5: Otimização e Performance]
 ├── Uso de imagens otimizadas em formato WebP
 ├── Lazy loading para imagens fora da tela (`loading="lazy"`)
 ├── Inclusão de atributos ARIA para acessibilidade
 └── Validação no Lighthouse para garantir score 90+ em Performance
```

---

## 6. Boas Práticas para Manter o Projeto Leve

1. **Evitar Dependências Pesadas:** Não utilize jQuery, Bootstrap, Tailwind completo ou bibliotecas pesadas de animação (como GSAP) caso o objetivo seja um arquivo HTML único ultra leve.
2. **GPU Acceleration:** Sempre prefira animar `transform` e `opacity`. Evite animar propriedades como `margin`, `padding`, `width` ou `height`, que causam *reflow* do layout.
3. **Imagens Otimizadas:** Utilize imagens compactadas (WebP ou SVGs para ícones). SVGs inline funcionam muito bem para animações de cores no CSS.
4. **Respeite Preferências do Usuário:** Inclua a media query `@media (prefers-reduced-motion: reduce)` para desativar animações intensas caso o usuário tenha essa configuração ativada no sistema operacional.