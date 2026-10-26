---
title: "Le défi du thème à l’aveugle"
linkTitle: "Défi à l’aveugle"
slug: "defi"
description: "Deux appels Zoom gratuits, les 30 et 31 octobre 2026 à 20 h (Paris) : six thèmes natals écrits comme des portraits, sans signes ni dates. Reconnaîtrez-vous le vôtre ? En anglais, pour les adultes."
type: event
eyebrow: "Gratuit · sur Zoom · en anglais · 18 ans et plus"
h1: "Six thèmes. <em>L’un d’eux est le vôtre.</em>"
lede: "Je dresse six thèmes natals et j’écris chacun comme un portrait, avec des mots simples, sans signes ni dates. Vous choisissez celui que vous pensez être le vôtre. Pour participer, choisissez une soirée et laissez votre nom et votre date de naissance."
# L’aperçu de la page quand on partage son lien (dessiné au déploiement par tools/brand-images).
shareTemplate: "challenge"
shareLabel: "Le défi du thème à l’aveugle"
shareTitle: "Six thèmes. <em>L’un est le vôtre.</em>"
shareText: "Gratuit sur Zoom, en anglais · vendredi 30 et samedi 31 octobre · 20 h, heure de Paris"
shareCount: 6

# Les appels. Les heures sont écrites une fois, à l’heure de Paris avec son décalage ; l’heure des autres
# villes en est déduite. Passez « full: true » une fois six personnes confirmées : la soirée ne peut plus
# être choisie. Le formulaire envoie au service indiqué dans hugo.toml ([params.signup]).
calls:
  - start: "2026-10-30T20:00:00+01:00"
    full: false
  - start: "2026-10-31T20:00:00+01:00"
    full: false
closes: "2026-10-29T20:00:00+01:00"
minutes: 75
places: 6
zones:
  - { tz: "Europe/Paris", name: "Paris" }
  - { tz: "Europe/London", name: "Londres" }
  - { tz: "America/New_York", name: "New York" }
  - { tz: "America/Los_Angeles", name: "Los Angeles" }
later: "Les deux appels se déroulent en anglais. D’autres, à des heures de soirée américaines, arrivent en novembre."
# Ce que devient le formulaire une fois envoyé.
success:
  label: "Merci"
  title: "Vous êtes sur la liste. <em>Surveillez vos emails.</em>"
  text: "Mon email confirme votre soirée, vous demande votre heure et votre lieu de naissance, et vous donne le lien Zoom."

steps:
  title: "Cinq étapes, <em>environ 75 minutes</em>"
  items:
    - title: "Vous vous inscrivez, plus haut"
      text: "Puis je vous écris pour connaître votre heure et votre lieu de naissance. L’heure compte ici : sans elle, pas de maisons, et votre portrait se distinguerait des cinq autres."
    - title: "Je dresse les six thèmes"
      text: "Et j’écris un portrait pour chacun, avec des mots simples : sans nom de signe, sans nom de planète, sans date. Chacun reçoit une lettre, de A à F, tirée au sort. Qui a quelle lettre part dans une enveloppe scellée avant l’appel."
    - title: "Je lis les six portraits"
      text: "À voix haute, un par un, et à l’écran, pour que vous puissiez y revenir."
    - title: "Vous choisissez, en privé"
      text: "Vous m’envoyez une lettre dans le chat privé : le portrait que vous pensez être le vôtre. Personne ne voit le choix des autres."
    - title: "J’ouvre l’enveloppe"
      text: "Devant la caméra, et je dis à chacun, en privé, quelle lettre était la sienne. Gardez votre lettre pour vous pendant l’appel : si cinq personnes disaient la leur, on connaîtrait celle de la sixième."

window: "Le hasard seul donne une bonne réponse sur six. <em>Voyons ce que les thèmes y ajoutent.</em>"

care:
  label: "Vos données"
  title: "Ce que deviennent <em>vos données de naissance</em>"
  items:
    - title: "Pour cet appel seulement"
      text: "Vos données de naissance servent à dresser votre thème pour l’appel, et à rien d’autre : jamais publiées, jamais vendues. Elles sont supprimées sous 60 jours."
    - title: "Pas d’enregistrement"
      text: "L’appel n’est pas enregistré. Les portraits portent une lettre, jamais un nom, une date ou un lieu."
    - title: "Seul le décompte est publié"
      text: "Ensuite, je publie combien de personnes ont reconnu leur propre portrait. Ni noms, ni données de naissance, rien qui permette de vous identifier."
    - title: "Adultes uniquement"
      text: "Les appels sont réservés aux personnes de 18 ans et plus, comme toutes mes lectures."
    - title: "Un soir chacun"
      text: "Si vous connaissez quelqu’un dans le même appel, vous pourriez reconnaître son portrait. Entre amis : inscrivez-vous à des soirs différents."
    - title: "Vous pouvez changer d’avis"
      text: "Répondez à mon email pour annuler (avant la clôture des inscriptions, quelqu’un d’autre pourra prendre votre place), et demandez-moi de supprimer vos données quand vous le souhaitez."

faq:
  - q: "Dois-je connaître mon heure de naissance ?"
    a: "Oui, pour ce test. Sans elle, pas de maisons, et votre portrait se distinguerait des cinq autres. [Voici où la trouver](/blog/unknown-birth-time/), pays par pays."
  - q: "Pourquoi en anglais ?"
    a: "Pour que les six personnes de chaque appel entendent les mêmes portraits, dans les mêmes mots. Ils sont lus à voix haute et affichés à l’écran : un anglais simple suffit."
  - q: "Les autres verront-ils ma date de naissance ?"
    a: "Non. Ils ne voient que les six portraits, chacun avec une lettre, et les lettres ne se disent pas pendant l’appel : personne ne sait qui est qui."
  - q: "Et si je me trompe ?"
    a: "Vous faites partie du décompte, comme tout le monde. Un mauvais choix m’en apprend autant qu’un bon : c’est à ça que sert un test."
  - q: "Est-ce une lecture ?"
    a: "Non. Un portrait tient en quelques lignes, écrites pour être distinguées de cinq autres. Une [lecture de thème natal](/birth-chart/) parcourt tout votre thème, placement par placement, en s’attardant là où c’est le plus important."
  - q: "Que ferez-vous des résultats ?"
    a: "Je publierai le décompte de chaque appel, et un compte rendu sur [le blog](/blog/) : ce qui a tenu, ce qui n’a pas tenu, et ce que je changerais. Par le seul hasard, quatre bonnes réponses ou plus sur douze arrivent environ une fois sur huit, et cinq ou plus moins d’une fois sur vingt-cinq : c’est donc cinq, la barre que je fixe avant les appels. Vous aurez le décompte, pas un best-of."
  - q: "Ces horaires ne me conviennent pas."
    a: "D’autres appels, à des heures de soirée américaines, arrivent en novembre. [Écrivez-moi](/contact/) et je vous préviendrai de leur ouverture."

closing:
  kicker: "Avant de vous inscrire"
  title: "Une question d’abord ? <em>Demandez-moi.</em>"
  text: "Sur les appels, sur le test, ou pour savoir si c’est pour vous. Je lis chaque message moi-même."
  cta: "M’écrire"
---
## Pourquoi à l’aveugle {glyph="☽"}

En 1948, un psychologue, Bertram Forer, a remis à chacun de ses étudiants un profil de personnalité « écrit pour lui ». Ils l’ont jugé exact à 4,26 sur 5. Tous avaient reçu le même texte, tiré pour l’essentiel d’un livre d’astrologie. On l’appelle aujourd’hui l’[effet Barnum](https://fr.wikipedia.org/wiki/Effet_Barnum).

C’est le point faible de toute lecture qu’on vous tend avec votre nom dessus, les miennes comprises : difficile de distinguer une lecture juste d’une lecture flatteuse. Alors, pendant ces appels, je ne vous tendrai pas la vôtre. Je vous en tendrai six, et vous choisirez.

## Pourquoi je le fais {glyph="♄"}

Je suis venue à l’astrologie pour m’en moquer, puis [j’ai vérifié mon propre thème comme une facture](/blog/i-tested-my-birth-chart/) : une coche ou une croix à côté de chaque placement. Environ un tiers a tenu. [Saturne](/astrology/saturn/), [Lilith](/astrology/black-moon-lilith/) et [Chiron](/astrology/chiron/) ont tenu bien plus souvent — c’est pour cela que je [lis comme je lis](/how-i-read/).

Mais c’était un carnet, pas un test : les personnes que je lisais savaient que le thème était le leur. Voici la version à l’aveugle. Si mes portraits sont bons, chacun devrait reconnaître le sien plus souvent qu’une fois sur six. S’ils ne le sont pas, je préfère le découvrir lors d’un appel gratuit qu’après que vous m’avez payé une lecture.

## À quoi ressemble un portrait {glyph="☿"}

Quelques lignes sur la façon dont une personne traverse une journée, ce qu’elle protège, ce vers quoi elle revient sans cesse. Toute ligne qui pourrait aller à n’importe qui est coupée : « vous êtes loyal mais vous avez besoin d’espace » ne passe pas. Ce qui reste, c’est la ligne qui va à une personne sur six, et pas aux cinq autres.
