<?php

$file = "ship.js";
$buff = file_get_contents($file);
$buff = str_replace('"mapDiffuse" : "', '"mapDiffuse" : "/star-war/objects/three.js/', $buff);
file_put_contents($file, $buff);

echo "done\n";
