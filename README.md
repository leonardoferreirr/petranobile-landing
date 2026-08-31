# Petra Nobile — landing

Landing de conversão para a **Petra Nobile**, fabricante de revestimentos em
pedras naturais em Santo André, SP. Cliente via Lucas. Substitui o site antigo
`revestircompedras.com.br`, que era template datado.

Estático puro: HTML + CSS + um arquivo de JS sem dependência. Sem build de
framework, sem node_modules.

## Rodar local

```
npx serve -l 8853 .
```

## Depois de editar o CSS

O `index.html` carrega o CSS **inline**, porque servido como arquivo ele
bloqueava a primeira pintura no celular. A fonte da verdade é
`assets/css/site.css`. Depois de editar:

```
python3 build.py
```

O script minifica o CSS, reancora os caminhos `../fonts/` (inline no
`index.html`, que está na raiz, eles quebrariam em silêncio) e carimba o
`site.js` com o hash do próprio conteúdo. Esse carimbo não é enfeite: o Vercel
serve `/assets/` com `immutable` por um ano, então sem trocar o nome do arquivo
quem já visitou fica um ano com o JS velho.

## Identidade

Paleta amostrada do logotipo do cliente, não escolhida no olho:

| | |
|---|---|
| `#103848` | navy petróleo, 90% dos pixels do logo |
| `#D0C0A0` | champanhe da tipografia |
| `#0B7A3B` | verde, **exclusivo de CTA** |

O verde não aparece em mais nada. É a única cor que pede clique, então dividir
ela com decoração enfraquece o botão.

Tipografia: Cormorant Garamond (display, é a serif mais próxima do logotipo) +
Jost (corpo). Self-hosted, com `font-display: optional` para não gerar CLS.

## Decisões que não são óbvias no código

- **Carrossel controla o próprio carregamento.** Dentro de um elemento com
  `transform`, o `loading="lazy"` erra para os dois lados. Os cards fora da
  janela inicial nascem com `data-src` e o JS promove para `src` conforme a
  pista anda, com folga de 2 cards.
- **Véu dos cards é mais opaco do que parece necessário.** Ele foi calibrado
  para o pior caso, que é a Pedra São Tomé: foto quase branca com texto
  champanhe por cima. Medido: pior título 7,00:1, pior descrição 12,32:1.
- **Nav tem sombra própria no topo.** A parede do hero tem pedras claras entre
  as escuras, e os links sumiam ao calhar sobre uma clara. A sombra sai de cena
  quando a nav ganha fundo sólido.
- **O mapa sempre carregou; o problema era o filtro.** `grayscale(1)` num mapa
  claro do Google deixa a área quase branca e parece que não carregou. Está
  dessaturado pela metade. A query também mudou: o endereço solto caía no
  centroide do CEP em vez do ponto exato.
- **Todo CTA passa por `obrigado.html`.** A página dispara o evento de conversão
  e só então abre o WhatsApp. Link direto para `wa.me` sai do site sem deixar
  rastro de que o lead converteu.
- **O hero é a parede se montando.** O logotipo já é um conjunto de quatro
  placas, e uma parede de mosaico é feita placa por placa. As texturas são
  reais, recortadas do próprio catálogo. Ganho colateral: como cada placa é
  pequena, o material de origem (limitado, 450x450) fica nítido, em vez de uma
  foto única ampliada quase 2x. Ficou mais leve que a foto que substituiu, e o
  LCP mobile caiu de 2,4s para 0,9s.

## Gate

Lighthouse com `--throttling-method=devtools` (o modo `simulate` é pessimista e
infla o LCP em cerca de 9 pontos):

| | perf | a11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| mobile | 100 | 100 | 100 | 100 | 0,9 s |
| desktop | 100 | 100 | 100 | 100 | 0,1 s |

CLS zero nos dois. Duas rodadas por formato, para descartar cold start.

Verificado em Chromium e WebKit, em desktop, tablet e mobile: 36 placas todas
assentadas, 8 cards sem altura zero, galeria medindo largura única (grade
regular de verdade), nenhuma foto quebrada, sem overflow horizontal, zero erro
de JS.

## A confirmar com o cliente

- Telefones, endereço e horário vieram do site antigo. Confirmar se seguem os
  mesmos na Petra Nobile.
- Os depoimentos são reais e públicos (Google), mas estão no nome da Revestir.
  Confirmar se a Petra Nobile é a mesma empresa antes de publicar.
- Domínio final (o código assume `petranobile.com.br` no canonical, OG e schema).
- Fotos em alta: as de origem chegam a 450x450, o que limita o hero. Com fotos
  maiores, o site melhora sem tocar no layout.
