/* ============================================================================
   NAYAK LAB — WEBSITE CONTENT
   ----------------------------------------------------------------------------
   This one file holds ALL the content that changes over time. Every page of
   the site reads from it, so editing here updates the whole site at once.

   EASIEST WAY TO EDIT: open  admin.html  in your browser. It gives you forms
   for everything below and a "Download content.js" button. Upload the file it
   gives you back to the server (replacing this one). Done.

   Prefer editing by hand? Go ahead — just keep the commas and quotes intact.

   IMAGES: put image files in the matching folder inside  assets/  and write
   the path here, e.g.  "assets/people/jane.png".  Leave img as ""  to show the
   person's initials instead of a photo.
   ============================================================================ */
window.LAB_CONTENT = {

  /* PEOPLE ------------------------------------------------------------------
     status: "current"  → shows in "Lab Group"
     status: "alumni"   → shows in "Lab alumni"
     Move someone to alumni by changing their status from "current" to "alumni".
     bio and past are optional (use "" to leave blank).                        */
  "people": [
    { "status": "current", "img": "assets/people/sunil.png", "name": "Sunil Gadhwal", "role": "Ph.D. Scholar",
      "bio": "Understanding the structure\u2013function relationship of the human intracellular two-pore-domain ion channel HsTPC2. Enjoys experimental research; sports are a stressbuster in free time.",
      "past": "Past:\nMSc Biotechnology (2019\u201321)\nBSBE, IIT Bombay" },
    { "status": "current", "img": "assets/people/pooja.png", "name": "Pooja Verma", "role": "Ph.D. Scholar",
      "bio": "Modeling the behaviour of neurons in the nicotinic addiction-and-withdrawal network, using the NEURON simulation environment to capture pathways with complex branched anatomy and biophysical membrane properties.",
      "past": "Past:\nB.Tech Electronics & Communication Engg, Maharaja Surajmal Institute of Technology, Delhi (2016\u201320)" },
    { "status": "current", "img": "assets/people/mahesh.png", "name": "Mahesh Mahadeo Mathe", "role": "Ph.D. Scholar",
      "bio": "Screening ion channels involved in neuropathic pain \u2014 in silico / in vitro HTS, transcriptomics, electrophysiology and MD simulations.",
      "past": "Past:\nM.Tech Medical Biotechnology, IIT Hyderabad (2018\u201320)" },
    { "status": "current", "img": "", "name": "Rajiv Sharma", "role": "Ph.D. Scholar",
      "bio": "Understanding the mechanism of nicotine binding to nAChRs and its role in synapse development, combining electrophysiology and computational studies.",
      "past": "Past:\nMSc Biotechnology, University of Hyderabad (2021\u201323)\nBSc Botany (Hons.), University of Delhi (2018\u20132021)" },
    { "status": "current", "img": "", "name": "Ritu Singh", "role": "Ph.D. Scholar",
      "bio": "Investigating the biophysical properties and functional role of ion channels in endolysosomes \u2014 ion permeability, channel regulation and intracellular trafficking.",
      "past": "Past:\nMSc Biochemistry, Institute of Sciences, Banaras Hindu University (2021\u20132023)\nBSc (Hons.) Biochemistry, University of Delhi (2018\u20132021)" },
    { "status": "current", "img": "", "name": "Gauri Saini", "role": "Ph.D. Scholar", "bio": "", "past": "" },
    { "status": "current", "img": "", "name": "Rakesh Barwar", "role": "Ph.D. Scholar", "bio": "", "past": "" },
    { "status": "current", "img": "", "name": "Jaweria Mariam", "role": "Ph.D. Scholar", "bio": "", "past": "" },
    { "status": "current", "img": "", "name": "Tanish Gupta", "role": "Ph.D. Scholar", "bio": "", "past": "" },
    { "status": "current", "img": "", "name": "Shayamolima Gogoi", "role": "Ph.D. Scholar",
      "bio": "Working on the role of ion channels in autophagy and neurodegeneration. Beyond research, enjoys books, TV shows and staying active through sports \u2014 a believer in being a \u2018jack of all trades\u2019 (and occasionally mastering a few).",
      "past": "Past:\nIntegrated MSc in Systems Biology, University of Hyderabad (2020\u20132025)" },
    { "status": "current", "img": "", "name": "Dhawal Kumar Jha", "role": "M.Sc. Student",
      "bio": "Passionate about understanding the nervous system at multiple scales \u2014 from the biophysics of ion channels to the computational logic of neural circuits and the transcriptional landscape of individual cells.",
      "past": "Past:\nMSc Biological Sciences, KSBS, IIT Delhi (2025\u20132026)\nBSc Zoology, Hansraj College, University of Delhi (2020\u20132023)" },
    { "status": "current", "img": "", "name": "Nikita", "role": "Student", "bio": "", "past": "" },

    { "status": "alumni", "img": "assets/people/sushanth.png", "name": "Sushanth Adusumilli", "role": "Ph.D. Scholar",
      "bio": "Investigating the intracellular TRPML3 ion channel; experienced in patch-clamp and RNA-seq data analysis. Finds satisfaction in understanding new concepts and teaching others \u2014 console and PC gaming are a favourite way to unwind.",
      "past": "Past:\nMS Biochemistry & Molecular Biology, University of Southern California (2016\u201318)" },
    { "status": "alumni", "img": "assets/people/pradeepti.png", "name": "Pradeepti Kampani", "role": "Ph.D. Scholar",
      "bio": "Studying allostery in a model GPCR \u2014 the muscarinic acetylcholine receptor with the GIRK channel as a reporter \u2014 using patch-clamp electrophysiology to capture the receptor\u2019s millisecond conformational changes. An avid reader who enjoys time with family and friends.",
      "past": "Past:\nMSc Biomedical Science, ACBR, University of Delhi (2014\u201316)" },
    { "status": "alumni", "img": "assets/people/awanish.png", "name": "Awanish Kumar", "role": "Post-doctoral Fellow",
      "bio": "Studied the role of choline in neuromuscular synapse formation using chick-embryo neuronal preparations, and how receptor engineering shapes synaptic responses during development.",
      "past": "Past:\nPostdoctoral Scholar, University of Kentucky\u2013Lexington, USA (2021\u20132022)" },
    { "status": "alumni", "img": "assets/people/nadira.png", "name": "Nadira Khatoon", "role": "Ph.D. Scholar",
      "bio": "Investigated ligand binding at the orthosteric site and allosteric modulation in neuronal nAChRs by patch-clamp \u2014 quantifying ligand-binding energies, gating energies and communication between allosteric and ligand-binding sites.",
      "past": "Past:\nMSc, University of Lucknow (2017\u20132019)" },
    { "status": "alumni", "img": "assets/people/poulomi.png", "name": "Poulomi Dey", "role": "Post-doctoral Fellow",
      "bio": "Now a postdoctoral fellow at the Centre of Molecular Biology and Genetics of Neurodegeneration, Dept. of Psychiatry, Icahn School of Medicine at Mount Sinai.", "past": "" },
    { "status": "alumni", "img": "assets/people/rachita.png", "name": "Rachita Sharma", "role": "MS(R) Scholar",
      "bio": "Now pursuing a PhD at the Max Planck Institute of Biophysics, Frankfurt.",
      "past": "Past:\nBTech, GGSIP University" }
  ],

  /* PUBLICATIONS ------------------------------------------------------------
     Newest first is nice but not required — the site groups them by "year".
     "year" can be a range like "2007\u20132011". url = link to the paper.       */
  "publications": [
    { "year": "2019", "title": "Efficiency measures the conversion of agonist binding energy into receptor conformational change", "authors": "Nayak TK, Vij R, Bruhova I, Shandilya J, Auerbach A", "venue": "J. Gen. Physiol.", "url": "https://doi.org/10.1085/jgp.201812215" },
    { "year": "2019", "title": "iPSC model of CHRFAM7A effect on \u03b17 nicotinic acetylcholine receptor function in the human context", "authors": "Ihnatovych I, Nayak TK, Ouf A, Sule N, Birkaya B, Auerbach A, Szigeti K", "venue": "Transl. Psychiatry", "url": "https://doi.org/10.1038/s41398-019-0382-0" },
    { "year": "2017", "title": "Cyclic activation of endplate acetylcholine receptors", "authors": "Nayak TK, Auerbach A", "venue": "PNAS", "url": "https://doi.org/10.1073/pnas.1700920114" },
    { "year": "2016", "title": "Structural correlates of affinity in fetal versus adult endplate nicotinic receptors", "authors": "Nayak TK, Chakrabarty S, Zheng W, Auerbach A", "venue": "Nat. Commun.", "url": "https://doi.org/10.1038/ncomms11352" },
    { "year": "2016", "title": "AP1 transcription factors are required to maintain the peripheral taste system", "authors": "Shandilya J, Gao Y, Nayak TK, Roberts S, Medler K", "venue": "Cell Death Dis.", "url": "https://doi.org/10.1038/cddis.2016.343" },
    { "year": "2014", "title": "Functional differences between neurotransmitter binding sites of muscle acetylcholine receptors", "authors": "Nayak TK, Bruhova I, Chakrabarty S, Gupta S, Zheng W, Auerbach A", "venue": "PNAS", "url": "https://doi.org/10.1073/pnas.1414378111" },
    { "year": "2014", "title": "Spatial and temporal characteristics of normal and perturbed axonal transport in vivo", "authors": "Iacobucci G, Rahman NA, Valtuena AA, Nayak TK, Gunawardena S", "venue": "PLoS One", "url": "https://doi.org/10.1371/journal.pone.0097237" },
    { "year": "2013", "title": "Asymmetric transmitter binding sites of fetal muscle acetylcholine receptors shape their synaptic response", "authors": "Nayak TK, Auerbach A", "venue": "PNAS", "url": "https://doi.org/10.1073/pnas.1308247110" },
    { "year": "2012", "title": "The intrinsic energy of the gating isomerization of a neuromuscular acetylcholine receptor channel", "authors": "Nayak TK, Purohit PG, Auerbach A", "venue": "J. Gen. Physiol.", "url": "https://doi.org/10.1085/jgp.201110752" },
    { "year": "2007\u20132011", "title": "Activator-induced dynamic disorder and molecular memory in human two-pore domain hTREK1 K\u207a channel", "authors": "Nayak TK, Dana S, Raha S, Sikdar SK", "venue": "J. Chem. Biol.", "url": "https://doi.org/10.1007/s12154-010-0049-z" },
    { "year": "2007\u20132011", "title": "Inhibition of human two-pore domain K\u207a channel TREK1 by local anesthetic lidocaine: negative cooperativity and half-of-sites saturation kinetics", "authors": "Nayak TK, Harinath S, Nama S, Somasundaram K, Sikdar SK", "venue": "Mol. Pharmacol.", "url": "https://doi.org/10.1124/mol.109.056838" },
    { "year": "2007\u20132011", "title": "Time-dependent molecular memory in single voltage-gated sodium channel", "authors": "Nayak TK, Sikdar SK", "venue": "J. Membr. Biol.", "url": "https://doi.org/10.1007/s00232-007-9059-3" }
  ],

  /* BOOK CHAPTERS & UNDER REVIEW (shown in their own block, no year, no link) */
  "publicationsOther": [
    { "title": "Protein engineering and design in ion channels and receptors (Book chapter)", "authors": "Khatoon N, Adusumilli S, Dey P, Sharma R, Kampani P, Shandilya J, Nayak TK (2022)", "venue": "Methods Cell Biol. 169:143\u2013168" },
    { "title": "Hydrophobic gating of the acetylcholine receptor channel pore", "authors": "Kumari M, Khatoon N, Adusumilli S, Sharma R, Auerbach A, Kashyap H, Nayak TK", "venue": "Under revision, J. Gen. Physiol." }
  ],

  /* LAB UPDATES / NEWS (homepage) — newest first. tag e.g. Research, Publication, People, Talk, Grant */
  "news": [
    { "date": "2024", "tag": "Research", "text": "New project launched on the hydrophobic gating of the acetylcholine receptor channel pore, combining electrophysiology with all-atom simulation." },
    { "date": "2023", "tag": "Publication", "text": "Book chapter \u201cProtein engineering and design in ion channels and receptors\u201d published in Methods in Cell Biology." },
    { "date": "2023", "tag": "People", "text": "The lab welcomes new PhD scholars joining the patch-clamp and computational teams." },
    { "date": "2022", "tag": "Talk", "text": "Group presented work on the energetics of agonist binding at the receptor biophysics symposium." }
  ],

  /* RESEARCH THEMES (homepage "Recent work" cards) */
  "research": [
    { "img": "assets/research/ligand-binding.jpg", "tag": "Energetics", "title": "Ligand-Binding Energetics", "blurb": "Quantifying how agonist binding energy is converted into receptor conformational change at single-channel resolution." },
    { "img": "assets/research/allosteric-communication.jpg", "tag": "Allostery", "title": "Allosteric Communication", "blurb": "How conformational signals propagate across receptor domains to couple binding at one site to gating at another." },
    { "img": "assets/research/neuropathic-pain.jpg", "tag": "Circuits", "title": "Neuropathic Pain", "blurb": "Dissecting nicotinic, glutamatergic and TRP channel contributions to chronic and inflammatory pain signalling." }
  ],

  /* GALLERY — list image paths in the order you want them shown.
     First image is the big featured one on the gallery page.                  */
  "gallery": [
    "assets/gallery/8.jpeg",
    "assets/gallery/9.jpeg",
    "assets/gallery/1.jpeg",
    "assets/gallery/5.jpeg",
    "assets/gallery/11.jpeg",
    "assets/gallery/3.jpeg",
    "assets/gallery/12.jpeg",
    "assets/gallery/7.jpeg",
    "assets/gallery/10.jpeg",
    "assets/gallery/13.jpeg",
    "assets/gallery/14.jpeg",
    "assets/gallery/20.jpeg",
    "assets/gallery/mughal-garden.jpg"
  ],

  /* OPEN POSITIONS (Join page) —
     status "Closed"  → the card is greyed out automatically.
     any other status ("Open", "Rolling", "Enquire") shows as a normal badge.  */
  "positions": [
    { "title": "PhD Students", "status": "Open", "desc": "Admission through the IIT Delhi PhD cycle. Strong interest in biophysics, physiology or quantitative biology required." },
    { "title": "Postdoctoral Fellows", "status": "Rolling", "desc": "NPDF, institute and external fellowships welcome. Experience in electrophysiology or simulation is a plus." },
    { "title": "Project Associates / RAs", "status": "Enquire", "desc": "Hands-on roles in electrophysiology, molecular biology and protein biochemistry." },
    { "title": "Masters & Interns", "status": "Enquire", "desc": "Short research projects, thesis work and summer rotations on the patch-clamp rig." }
  ]

};
