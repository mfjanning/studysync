<template>
  hier eine einzelne klausur, zb mit bild und unten die überschrift der klausur (wieder mit props von den eltern,
  übergeben). das elternteil bekommt das mit einem fetch aus der db (das müsste merlin übernehmen). überlegung von ole:
  die ganzen klasuren nicht auf einer globalen seite, sondern auf der jeweiligen kurs seite /courses/[id],
  der fetch muss bei dem elternteil (courses/[id]) dann natürlich die id berücksichtigen im select. jede klausur sollte
  als attribut einen link haben, mit der man sie runterladen kann, jede component bekommt dann einen link mit 
  jeweiligen href, der wird auch über props übergebn
</template>