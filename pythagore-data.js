const capsuleData = {
  title: "Pythagore",
  levels: "4e / 3e",
  duration: "18 min",

  steps: [
    {
      type: "image",
      title: "Comment fonctionne la capsule ?",
      src: "pythagore.png"
    },

    {
      type: "video",
      title: "0. Introduction",
      src: ""
    },

    {
    type:"pdf",
    title:"Fiche méthode",
    src:"assets/Pythagore/pdfs/fiche1.pdf",
    loginRequired:true
},

    {
      type: "quiz",
      quizType: "qcm",
      title: "QCM",
      question: "Peut-on utiliser Pythagore dans n'importe quel triangle ?",
      answers: [
        "Oui, toujours",
        "Non, seulement dans un triangle rectangle",
        "Seulement dans un triangle isocèle"
      ],
      correctAnswer: "Non, seulement dans un triangle rectangle"
    }
  ]
};