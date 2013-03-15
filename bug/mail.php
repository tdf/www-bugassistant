<?php

  if ($_POST["assigned_to"] != "libreoffice-bugs@lists.freedesktop.org")
  {
    echo("FALSE");
  }

 $to = "qa@fr.libreoffice.org";
 $subject = "Bug sur Nouveau dans le BSA français!";
 $body = "Bonjour,\n\nIl y a une nouvelle soumission de bug déposée en français. L'un d'entre vous peut-il le confirmer ou le traduire pour nous.\n\n";
 $body = $body."Composant: ".$_POST["component"]."\n";
 $body = $body."Version: ".$_POST["version"]."\n";
 $body = $body."Keywords: ".$_POST["keywords"]."\n";
 $body = $body."Sujet: ".$_POST["short_desc"]."\n";
 $body = $body."Description longue: ".$_POST["comment"]."\n";
 $body = $body."\n\nMerci de nous aider,\nBSA";

 $headers = "From: ".$to."\r\n";
 $headers .= "CC: ".$_POST["BSAemail"]."\r\n";

 if (mail($to, $subject, $body, $headers)) {
   echo("TRUE");
 } else {
   echo("FALSE");
 }
?>
