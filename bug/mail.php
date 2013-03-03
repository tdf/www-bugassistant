<?php

  if ($_POST["assigned_to"] != "libreoffice-bugs@lists.freedesktop.org")
  {
    echo("FALSE");
  }

 $to = "programming@ertai.nl";
 $subject = "Bug sur Nouveau dans le BSA français!";
 $body = "Salut,\n\nIl y avait un bug nouvelle demande déposée en français. Quelqu'un peut il confirmer le bug ou le traduire pour nous?\n\n";
 $body = $body."Composant: ".$_POST["component"]."\n";
 $body = $body."Version: ".$_POST["version"]."\n";
 $body = $body."Keywords: ".$_POST["keywords"]."\n";
 $body = $body."Sujet: ".$_POST["short_desc"]."\n";
 $body = $body."Description longue: ".$_POST["comment"]."\n";
 $body = $body."\n\nMerci de nous aider,\nBSA";

 if (mail($to, $subject, $body)) {
   echo("TRUE");
 } else {
   echo("FALSE");
 }
?>
