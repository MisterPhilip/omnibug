<?xml version="1.0" encoding="UTF-8"?>

<RDF:RDF xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
    <RDF:Description about="urn:mozilla:extension:Omnibug@rosssimpson.com">
        <em:updates>
            <RDF:Seq>

                <RDF:li>
                    <RDF:Description>
                        <em:version>XXX</em:version> <!-- This is the version number of the add-on -->

                        <!-- One targetApplication for each application the add-on is compatible with -->
                        <em:targetApplication>
                            <RDF:Description>
                                <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id>
                                <em:minVersion>1.5</em:minVersion>
                                <em:maxVersion>2.0.0.*</em:maxVersion>
            
                                <!-- This is where this version of the add-on will be downloaded from -->
                                <em:updateLink>https://www.rosssimpson.com/dev/omnibug-XXX.xpi</em:updateLink>
            
                                <!-- A page describing what is new in this updated version -->
                                <em:updateInfoURL>http://www.rosssimpson.com/dev/omnibug.html</em:updateInfoURL>
                            </RDF:Description>
                        </em:targetApplication>
                    </RDF:Description>
                </RDF:li>

            </RDF:Seq>
        </em:updates>
    </RDF:Description>
</RDF:RDF>

