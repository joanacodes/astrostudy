---
title: "Confidentialité"
slug: "confidentialite"
description: "Ce que The Astro Study collecte, pourquoi, qui d’autre y a accès, combien de temps, et vos droits selon le RGPD. Ni cookies, ni pistage."
eyebrow: "Confidentialité"
h1: "Vos données, <em>traitées comme il se doit.</em>"
lede: "Une lecture demande des choses personnelles — vos données de naissance, parfois celles de quelqu’un d’autre, parfois votre histoire. Voici exactement ce qu’elles deviennent."
---
## Qui est responsable

{{< controller >}} Vous pouvez m’écrire à {{< email >}} pour toute question sur cette page.

## Ce que je collecte, et pourquoi

**Quand vous m’écrivez** par le formulaire ou par email, je reçois votre nom, votre adresse email et votre message — pour vous répondre.

**Quand vous commandez une lecture**, je reçois, avec votre paiement :

- **votre nom et votre adresse email** — pour vous livrer votre lecture et rester en contact à son sujet ;
- **la lecture et la formule choisies** ;
- **vos données de naissance** — date, heure et lieu de naissance — et, pour une synastrie, le prénom et les données de naissance de l’autre personne ;
- **ce que vous ajoutez pour moi** dans la commande.

Dans le formulaire de commande, les données de naissance ne me parviennent qu’avec un paiement. Elles servent à préparer et à livrer votre lecture, et à rien d’autre : jamais publiées, jamais vendues, jamais utilisées à des fins de marketing. Au sens du RGPD, la base légale est le contrat qui nous lie — et, avant lui, les mesures prises à votre demande.

## Les données de quelqu’un d’autre

Pour une lecture de synastrie, la commande demande les données de naissance d’une autre personne. Ne les donnez que si elle sait que vous demandez cette lecture — le formulaire de commande vous demande de le confirmer — et, pour une lecture entre collègues, seulement avec son accord. J’utilise ses données pour votre lecture, et pour rien d’autre.

## Les appels à l’aveugle

Pour les [appels à l’aveugle](/challenge/), gratuits, le formulaire d’inscription demande votre nom (ou un pseudo), votre adresse email, votre date de naissance et la soirée choisie ; mon email vous demande ensuite votre heure et votre lieu de naissance. Je m’en sers pour dresser votre thème, écrire votre portrait pour l’appel et vous envoyer le lien, et pour rien d’autre. La base légale est votre demande de participation : vous pouvez annuler, et me demander de supprimer vos données, à tout moment.

Les appels ne sont pas enregistrés. Ensuite, je publie seulement le nombre de personnes qui ont reconnu leur propre portrait. Les inscriptions, et toute note qui relie une personne à une date de naissance, sont supprimées dans les 60 jours qui suivent l’appel.

## Le test à l’aveugle

Pour le [test à l’aveugle](/test/), gratuit, le formulaire demande votre nom (ou un pseudo), votre adresse email, la date, l’heure et le lieu de votre naissance et la durée de test que vous souhaitez ; il enregistre ensuite chacune de vos réponses. Je m’en sers pour dresser votre thème, écrire vos questions, vous donner votre score et écrire votre lecture complète, qui vous attend sur une page privée qui ne s’ouvre qu’avec votre date de naissance. La base légale est votre consentement, donné en cochant la case du formulaire : vous pouvez le retirer, et me demander de tout effacer, à tout moment.

Vos réponses rejoignent l’étude. Je n’en publie que des chiffres d’ensemble, par exemple combien de fois on reconnaît son propre thème dans chaque domaine de la vie : jamais un nom, une adresse email ou une date de naissance. Si vous cochez aussi « Envoyez-moi les nouvelles de The Astro Study », j’utilise aussi votre adresse email pour ces nouvelles, et chaque email contient un lien pour les arrêter ; sinon, votre adresse ne sert à rien d’autre.

Le test fonctionne avec mon propre logiciel de lecture, AGS : vos données sont conservées dans sa base de données, et les services sur lesquels il s’appuie sont listés ci-dessous.

## Qui d’autre y a accès

- **FormSubmit** ([formsubmit.co](https://formsubmit.co)) reçoit ce que vous tapez dans le formulaire et le transfère dans ma boîte mail. Ses propres règles de confidentialité, sur son site, expliquent ce qu’il conserve.
- **Mon fournisseur de messagerie** conserve nos échanges.
- **{{< host >}}** héberge ce site et, comme tout hébergeur, conserve brièvement des journaux techniques (comme les adresses IP) pour faire fonctionner le site et le sécuriser.
- **Photon** ([photon.komoot.io](https://photon.komoot.io)), un moteur de recherche de lieux libre, construit sur OpenStreetMap, suggère des villes pendant que vous tapez un lieu de naissance dans le formulaire de commande ou dans le test. {{% on-host "cloudflare" %}}Il est interrogé par le serveur de ce site : il reçoit les lettres tapées dans ce champ, et rien sur vous.{{% /on-host %}}{{% on-host "github" %}}Sur cette version de prévisualisation, votre navigateur l’interroge directement : il reçoit les lettres tapées dans ce champ et, comme tout site web, votre adresse IP.{{% /on-host %}}
- **Supabase** ([supabase.com](https://supabase.com)) héberge la base de données où le test conserve vos données, vos réponses et votre lecture.
- **Vercel** ([vercel.com](https://vercel.com)) et **Cloudflare** ([cloudflare.com](https://www.cloudflare.com)) font tourner le logiciel du test et conservent brièvement, comme tout hébergeur, des journaux techniques (comme les adresses IP).
- **FreeAstroAPI** ([freeastroapi.com](https://freeastroapi.com)) calcule votre thème pour le test : il reçoit votre nom tel que vous l’avez tapé, et la date, l’heure et le lieu de votre naissance.
- **Anthropic** ([anthropic.com](https://www.anthropic.com)), qui conçoit Claude, écrit les descriptions de votre test et votre lecture à partir de votre thème : il reçoit votre thème et, pour la lecture, votre nom tel que vous l’avez tapé, jamais votre adresse email.
- **Open-Meteo** ([open-meteo.com](https://open-meteo.com)) donne le fuseau horaire de votre lieu de naissance à partir de ses coordonnées, et ne reçoit rien d’autre.
- **Zoom** ([zoom.com](https://zoom.com)) gère les appels à l’aveugle eux-mêmes : il reçoit le nom que vous indiquez en rejoignant l’appel, et ce qui y est dit et montré. Sa propre politique de confidentialité, sur son site, explique ce qu’il conserve.
{{% payments %}}- **Stripe** ([stripe.com](https://stripe.com)) gère les paiements : vos coordonnées bancaires vont chez Stripe, jamais chez moi, et Stripe conserve ce que la loi demande à un prestataire de paiement.{{% /payments %}}

Ces services peuvent stocker ou traiter des données hors de l’Union européenne — {{< host >}}, par exemple, est basé aux États-Unis. Chacun présente ses propres garanties sur son site.

## Ni cookies, ni pistage

Ce site ne dépose aucun cookie, et n’utilise ni outil de mesure d’audience ni traceur publicitaire. Les polices sont servies par ce site, pas par un tiers. La prairie en mouvement derrière les pages est dessinée par votre propre navigateur ; rien n’en est envoyé nulle part.{{% live-sky %}} Les positions des planètes sur ces pages viennent de [FreeAstroAPI](https://freeastroapi.com), interrogé par ce site lui-même quelques fois par jour — jamais par votre navigateur, et rien sur vous ne lui est envoyé. Votre navigateur fait ensuite avancer les planètes à la minute près.{{% /live-sky %}}

## Combien de temps je garde tout cela

Les messages qui n’aboutissent pas à une lecture sont supprimés dans un délai de douze mois. Pour les lectures, je garde ce dont j’ai besoin tant que vous êtes susceptible de revenir vers moi avec des questions à leur sujet, et pas plus de deux ans — sauf si vous me demandez de l’effacer plus tôt, ce que vous pouvez faire à tout moment. Pour le test à l’aveugle, vos données, vos réponses et votre lecture sont conservées le temps de l’étude, et pas plus de trois ans, pour que les chiffres publiés puissent être vérifiés ; vous pouvez me demander de les effacer plus tôt, à tout moment.

## Vos droits

Vous pouvez me demander de vous montrer ce que je détiens à votre sujet, de le corriger, de l’effacer, d’en limiter ou d’en arrêter l’usage, ou de vous le remettre dans un format que vous pourrez emporter ailleurs — et, comme la loi française le permet, me dire ce qu’il doit devenir après votre décès. Il suffit d’écrire à {{< email >}}. Si la façon dont j’ai traité vos données ne vous convient pas, vous pouvez déposer une réclamation auprès de la CNIL ([cnil.fr](https://www.cnil.fr)), ou de l’autorité de protection des données du pays où vous vivez — au Royaume-Uni, l’Information Commissioner’s Office ([ico.org.uk](https://ico.org.uk)) — mais j’aimerais avoir d’abord l’occasion d’arranger les choses.

*Dernière mise à jour : octobre 2026.*
