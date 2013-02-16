<?php

  if ($_POST["assigned_to"] != "libreoffice-bugs@lists.freedesktop.org")
  {
    echo("FALSE");
  }

 $to = "";
 $subject = "New Bug via the French BSA!";
 $body = "Hi,\n\nThere was a new bug filed in french. Can somebody triage it for us?\n\n";
 $body = $body."Composant: ".$_POST["component"]."\n";
 $body = $body."Version: ".$_POST["version"]."\n";
 $body = $body."Système d'exploitation: ".$_POST["op_sys"]."\n";
 $body = $body."Keywords: ".$_POST["keywords"]."\n";
 $body = $body."Description longue: ".$_POST["comment"]."\n";
 $body = $body."\n\nThank you for helping,\nBSA";

 if (mail($to, $subject, $body)) {
   echo("TRUE");
 } else {
   echo("FALSE");
 }
?>
