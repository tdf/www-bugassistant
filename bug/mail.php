<?php

  if ($_POST["assigned_to"] != "libreoffice-bugs@lists.freedesktop.org")
  {
    echo("FALSE");
  }

 $to = "qa@fr.libreoffice.org";
 $subject = "Bug sur Nouveau dans le BSA français!";
 $body = "Bonjour,\n\nIl y a une nouvelle soumission de bug déposée en français. L'un d'entre vous peut-il le confirmer ou le traduire pour nous.\n\n";
 $body = $body."Composant: ".check_input($_POST["component"])."\n";
 $body = $body."Version: ".check_input($_POST["version"])."\n";
 $body = $body."Keywords: ".check_input($_POST["keywords"])."\n";
 $body = $body."Sujet: ".check_input($_POST["short_desc"])."\n";
 $body = $body."Description longue: ".check_input($_POST["comment"])."\n";
 $body = $body."\n\nMerci de nous aider,\nBSA";

 $headers = "Return-Path: hostmaster@documentfoundation.org\r\n";
 $headers.= "From: hostmaster@documentfoundation.org\r\n";
 $headers.= "Cc: ".check_input($_POST["BSAemail"])."\r\n";
 $headers.= "Content-type: text/plain; charset=UTF-8";

 if (mail($to, $subject, $body, $headers)) {
   echo("TRUE");
 } else {
   echo("FALSE");
 }

function check_input($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

?>
